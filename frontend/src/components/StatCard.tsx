import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  iconColor: string
  iconBg: string
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  iconColor,
  iconBg
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            {trend && (
              <div className="flex items-center mt-2">
                <span className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded-full",
                  trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {trend}
                </span>
                <span className="text-xs text-gray-400 ml-1.5">vs last month</span>
              </div>
            )}
          </div>
          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", iconBg)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StatCard
