import React from 'react'

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-48 w-full bg-neutral-200" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 w-1/4 bg-neutral-200 rounded" />
          <div className="h-4 w-1/5 bg-neutral-200 rounded" />
        </div>
        <div className="h-6 w-3/4 bg-neutral-200 rounded" />
        <div className="h-4 w-1/2 bg-neutral-200 rounded" />
        <div className="h-2 w-full bg-neutral-200 rounded-full mt-2" />
        <div className="pt-2 flex justify-between items-center">
          <div className="h-6 w-1/3 bg-neutral-200 rounded" />
          <div className="h-10 w-24 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="card p-6 animate-pulse flex items-center gap-4">
      <div className="h-12 w-12 rounded-2xl bg-neutral-200 shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-4 w-1/2 bg-neutral-200 rounded" />
        <div className="h-7 w-1/3 bg-neutral-200 rounded" />
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-neutral-100 animate-pulse">
      <div className="h-10 w-10 rounded-xl bg-neutral-200 shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-4 w-1/3 bg-neutral-200 rounded" />
        <div className="h-3 w-1/4 bg-neutral-200 rounded" />
      </div>
      <div className="h-8 w-20 bg-neutral-200 rounded-lg" />
    </div>
  )
}
