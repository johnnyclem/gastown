package web

import "sync"

// ThreadSafeConvoyFetcher serializes access to a ConvoyFetcher implementation.
type ThreadSafeConvoyFetcher struct {
	fetcher ConvoyFetcher
	mu      sync.Mutex
}

// NewThreadSafeConvoyFetcher wraps a fetcher with a mutex.
func NewThreadSafeConvoyFetcher(fetcher ConvoyFetcher) *ThreadSafeConvoyFetcher {
	return &ThreadSafeConvoyFetcher{fetcher: fetcher}
}

// FetchConvoys fetches convoy data with serialization.
func (f *ThreadSafeConvoyFetcher) FetchConvoys() ([]ConvoyRow, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.fetcher.FetchConvoys()
}

// FetchMergeQueue fetches merge queue data with serialization.
func (f *ThreadSafeConvoyFetcher) FetchMergeQueue() ([]MergeQueueRow, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.fetcher.FetchMergeQueue()
}

// FetchPolecats fetches polecat data with serialization.
func (f *ThreadSafeConvoyFetcher) FetchPolecats() ([]PolecatRow, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.fetcher.FetchPolecats()
}
