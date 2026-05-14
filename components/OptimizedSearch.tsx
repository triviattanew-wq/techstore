'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/usePerformance'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  image?: string
}

interface HighlightedSearchResult extends SearchResult {
  highlightedName: string
}

interface OptimizedSearchProps {
  onSearch: (query: string) => Promise<SearchResult[]>
  placeholder?: string
  className?: string
  debounceMs?: number
  minQueryLength?: number
}

export function OptimizedSearch({
  onSearch,
  placeholder = 'Поиск товаров...',
  className,
  debounceMs = 300,
  minQueryLength = 2
}: OptimizedSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const debouncedSearch = useDebounce(async (searchQuery: string) => {
    if (searchQuery.length < minQueryLength) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const searchResults = await onSearch(searchQuery)
      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, debounceMs)

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(value.length >= minQueryLength)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false)
    // Navigate to product page
    window.location.href = `/product/${result.slug}`
  }

  const highlightedResults: HighlightedSearchResult[] = useMemo(() => {
    if (!query) return results.map(r => ({ ...r, highlightedName: r.name }))

    return results.map(result => ({
      ...result,
      highlightedName: result.name.replace(
        new RegExp(`(${query})`, 'gi'),
        '<mark class="bg-yellow-200">$1</mark>'
      )
    }))
  }, [results, query])

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Поиск...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {highlightedResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  {result.image && (
                    <img
                      src={result.image}
                      alt={result.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div
                      className="font-medium text-sm"
                      dangerouslySetInnerHTML={{ __html: result.highlightedName }}
                    />
                    <div className="text-xs text-gray-500">
                      {result.price.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= minQueryLength ? (
            <div className="p-4 text-center text-gray-500">
              Ничего не найдено
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}