import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { TIME_SLOTS } from '../lib/siteConfig'

export type SlotStatus = 'available' | 'booked'

export type SlotInfo = {
  id: string
  label: string
  status: SlotStatus
}

/**
 * Fetches booked slots for a given product on a specific date.
 * Returns each time slot with its availability status.
 */
export function useBookingSlots(productId: string | undefined, date: string | null) {
  const [slots, setSlots] = useState<SlotInfo[]>(
    TIME_SLOTS.map(s => ({ id: s.id, label: s.label, status: 'available' as SlotStatus }))
  )
  const [loading, setLoading] = useState(false)

  const fetchSlots = useCallback(async () => {
    if (!supabase || !productId || !date) {
      setSlots(TIME_SLOTS.map(s => ({ id: s.id, label: s.label, status: 'available' })))
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('time_slot, payment_status')
        .eq('product_id', productId)
        .eq('booking_date', date)
        .eq('payment_status', 'paid')

      const bookedSlotIds = new Set(
        (data || []).map((b: { time_slot: string }) => b.time_slot)
      )

      setSlots(
        TIME_SLOTS.map(s => ({
          id: s.id,
          label: s.label,
          status: bookedSlotIds.has(s.id) ? 'booked' : 'available',
        }))
      )
    } catch (err) {
      console.error('Error fetching booking slots:', err)
      // On error, show all as available rather than blocking
      setSlots(TIME_SLOTS.map(s => ({ id: s.id, label: s.label, status: 'available' })))
    } finally {
      setLoading(false)
    }
  }, [productId, date])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  return { slots, loading, refetch: fetchSlots }
}

/**
 * Fetches all booked dates for a product in a given month.
 * Returns a Set of date strings (YYYY-MM-DD) that have ALL slots booked.
 */
export function useBookedDates(productId: string | undefined, year: number, month: number) {
  const [fullyBookedDates, setFullyBookedDates] = useState<Set<string>>(new Set())
  const [partiallyBookedDates, setPartiallyBookedDates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supabase || !productId) return

    async function fetch() {
      setLoading(true)
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

      try {
        const { data } = await supabase!
          .from('bookings')
          .select('booking_date, time_slot')
          .eq('product_id', productId!)
          .eq('payment_status', 'paid')
          .gte('booking_date', startDate)
          .lte('booking_date', endDate)

        const dateSlotMap = new Map<string, Set<string>>()
        for (const b of data || []) {
          if (!dateSlotMap.has(b.booking_date)) {
            dateSlotMap.set(b.booking_date, new Set())
          }
          dateSlotMap.get(b.booking_date)!.add(b.time_slot)
        }

        const fully = new Set<string>()
        const partially = new Set<string>()
        for (const [date, slotsSet] of dateSlotMap) {
          if (slotsSet.size >= TIME_SLOTS.length) {
            fully.add(date)
          } else {
            partially.add(date)
          }
        }

        setFullyBookedDates(fully)
        setPartiallyBookedDates(partially)
      } catch (err) {
        console.error('Error fetching booked dates:', err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [productId, year, month])

  return { fullyBookedDates, partiallyBookedDates, loading }
}
