
const API_BASE_URL = 'http://localhost:9090/api'

// Get services for a shop
export async function getShopServices(shopId) {
  const response = await fetch(
    `${API_BASE_URL}/shops/${shopId}/services`
)

if (!response.ok) {
    throw new Error('Failed to load shop services.')
}

return await response.json()
}

// Get available appointment times
export async function getAvailability(
    shopId,
    date,
    serviceIds,
    adultCount = 1,
    childCount = 0
) {
    const params = new URLSearchParams({
        date,
        serviceIds: serviceIds.join(','),
        adultCount: String(adultCount),
        childCount: String(childCount)
    })

    const response = await fetch(
        `${API_BASE_URL}/shops/${shopId}/availability?${params.toString()}`
    )

    if (!response.ok) {
        throw new Error('Failed to load available appointment times.')
    }

    return await response.json()
}

