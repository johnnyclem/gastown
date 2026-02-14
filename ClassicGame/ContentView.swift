import SwiftUI

private struct Cell: Hashable {
    let x: Int
    let y: Int
}

private enum Direction {
    case up, down, left, right

    var delta: (dx: Int, dy: Int) {
        switch self {
        case .up: return (0, -1)
        case .down: return (0, 1)
        case .left: return (-1, 0)
        case .right: return (1, 0)
        }
    }

    func isOpposite(of other: Direction) -> Bool {
        switch (self, other) {
        case (.up, .down), (.down, .up), (.left, .right), (.right, .left):
            return true
        default:
            return false
        }
    }
}

struct ContentView: View {
    private let columns = 14
    private let rows = 20
    private let tickInterval = 0.18

    @State private var snake: [Cell] = [Cell(x: 5, y: 10), Cell(x: 4, y: 10), Cell(x: 3, y: 10)]
    @State private var direction: Direction = .right
    @State private var nextDirection: Direction = .right
    @State private var food: Cell = Cell(x: 9, y: 10)
    @State private var isRunning = false
    @State private var isGameOver = false
    @State private var score = 0

    private var timer: Publishers.Autoconnect<Timer.TimerPublisher> {
        Timer.publish(every: tickInterval, on: .main, in: .common).autoconnect()
    }

    var body: some View {
        VStack(spacing: 16) {
            Text("Snake")
                .font(.largeTitle.bold())

            Text("Score: \(score)")
                .font(.headline)

            GeometryReader { proxy in
                let cellSize = min(proxy.size.width / CGFloat(columns), proxy.size.height / CGFloat(rows))
                let boardWidth = cellSize * CGFloat(columns)
                let boardHeight = cellSize * CGFloat(rows)

                ZStack {
                    Rectangle()
                        .fill(Color.black)
                        .frame(width: boardWidth, height: boardHeight)

                    ForEach(0..<(columns * rows), id: \.self) { index in
                        let x = index % columns
                        let y = index / columns
                        Rectangle()
                            .fill(Color.gray.opacity(0.2))
                            .frame(width: cellSize - 1, height: cellSize - 1)
                            .position(x: cellSize * (CGFloat(x) + 0.5), y: cellSize * (CGFloat(y) + 0.5))
                    }

                    ForEach(snake, id: \.self) { cell in
                        Rectangle()
                            .fill(cell == snake.first ? Color.green : Color.green.opacity(0.7))
                            .frame(width: cellSize - 1, height: cellSize - 1)
                            .position(x: cellSize * (CGFloat(cell.x) + 0.5), y: cellSize * (CGFloat(cell.y) + 0.5))
                    }

                    Rectangle()
                        .fill(Color.red)
                        .frame(width: cellSize - 2, height: cellSize - 2)
                        .position(x: cellSize * (CGFloat(food.x) + 0.5), y: cellSize * (CGFloat(food.y) + 0.5))

                    if isGameOver {
                        VStack(spacing: 8) {
                            Text("Game Over")
                                .font(.title.bold())
                                .foregroundColor(.white)
                            Text("Tap Restart")
                                .foregroundColor(.white.opacity(0.8))
                        }
                        .padding(12)
                        .background(Color.black.opacity(0.7))
                        .cornerRadius(12)
                    }
                }
                .frame(width: boardWidth, height: boardHeight)
                .position(x: proxy.size.width / 2, y: proxy.size.height / 2)
            }
            .frame(height: 360)

            VStack(spacing: 10) {
                Button(isRunning ? "Pause" : "Start") {
                    if isGameOver {
                        restart()
                    }
                    isRunning.toggle()
                }
                .buttonStyle(.borderedProminent)

                HStack(spacing: 12) {
                    Button("Left") { turn(.left) }
                        .buttonStyle(.bordered)
                    VStack(spacing: 8) {
                        Button("Up") { turn(.up) }
                            .buttonStyle(.bordered)
                        Button("Down") { turn(.down) }
                            .buttonStyle(.bordered)
                    }
                    Button("Right") { turn(.right) }
                        .buttonStyle(.bordered)
                }
            }
        }
        .padding()
        .onReceive(timer) { _ in
            guard isRunning, !isGameOver else { return }
            step()
        }
        .onAppear {
            food = randomFood(excluding: Set(snake))
        }
    }

    private func turn(_ newDirection: Direction) {
        guard !newDirection.isOpposite(of: direction) else { return }
        nextDirection = newDirection
    }

    private func step() {
        direction = nextDirection
        guard let head = snake.first else { return }
        let delta = direction.delta
        let newHead = Cell(x: head.x + delta.dx, y: head.y + delta.dy)

        if newHead.x < 0 || newHead.x >= columns || newHead.y < 0 || newHead.y >= rows {
            isGameOver = true
            isRunning = false
            return
        }

        if snake.contains(newHead) {
            isGameOver = true
            isRunning = false
            return
        }

        snake.insert(newHead, at: 0)

        if newHead == food {
            score += 1
            food = randomFood(excluding: Set(snake))
        } else {
            _ = snake.popLast()
        }
    }

    private func restart() {
        snake = [Cell(x: 5, y: 10), Cell(x: 4, y: 10), Cell(x: 3, y: 10)]
        direction = .right
        nextDirection = .right
        score = 0
        isGameOver = false
        food = randomFood(excluding: Set(snake))
    }

    private func randomFood(excluding occupied: Set<Cell>) -> Cell {
        var candidate = Cell(x: Int.random(in: 0..<columns), y: Int.random(in: 0..<rows))
        while occupied.contains(candidate) {
            candidate = Cell(x: Int.random(in: 0..<columns), y: Int.random(in: 0..<rows))
        }
        return candidate
    }
}
