'use client';

import { useGastownStore } from '@/lib/store';
import { TopBar } from '@/components/town-map/top-bar';
import { TownMap } from '@/components/town-map/town-map';
import { BuildingInterior } from '@/components/building-interior/building-interior';
import { BattleTerminal } from '@/components/battle-terminal/battle-terminal';
import { Highway } from '@/components/highway/highway';
import { CityHall } from '@/components/city-hall/city-hall';
import { useGastownRealtime } from '@/hooks/use-gastown-realtime';

function ViewRouter() {
  const { currentView } = useGastownStore();

  switch (currentView) {
    case 'town_map':
      return <TownMap />;
    case 'building_interior':
      return <BuildingInterior />;
    case 'battle_terminal':
      return <BattleTerminal />;
    case 'highway':
      return <Highway />;
    case 'city_hall':
      return <CityHall />;
    default:
      return <TownMap />;
  }
}

function Footer() {
  const { lastUpdate, isLive, userRole } = useGastownStore();

  return (
    <footer className="sticky bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-10 items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            Gastown Command Center v0.1
          </span>
          <span>•</span>
          <span>
            Speed with evidence. Memory at every gate.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={isLive ? 'text-emerald-500' : 'text-amber-500'}>
              {isLive ? '●' : '○'}
            </span>
            <span>{isLive ? 'Live' : 'Paused'}</span>
          </div>
          <span>•</span>
          <span>Role: {userRole}</span>
          <span>•</span>
          <span>
            Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  // Initialize real-time connection
  useGastownRealtime({ tenantId: 'tenant_001', enabled: true });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <main className="flex-1">
        <ViewRouter />
      </main>
      <Footer />
    </div>
  );
}
