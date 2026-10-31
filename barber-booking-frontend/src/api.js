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
    adultServiceIds,
    childServiceIds,
    adultCount = 1,
    childCount = 0
) {
    const params = new URLSearchParams()


params.append('date', date)

adultServiceIds.forEach(id => {
    params.append('adultServiceIds', id)
})

childServiceIds.forEach(id => {
    params.append('childServiceIds', id)
})

params.append('adultCount', String(adultCount))
params.append('childCount', String(childCount))

const response = await fetch(
    `${API_BASE_URL}/shops/${shopId}/availability?${params.toString()}`
)

    const data = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(
            data?.message || 'Failed to load available appointment times.'
        )
    }

    return data


}

// Create a new appointment
export async function createAppointment(shopId, appointmentData) {
const response = await fetch(
`${API_BASE_URL}/shops/${shopId}/appointments`,
    {
        method: 'POST',
            headers: {
        'Content-Type': 'application/json'
    },
        body: JSON.stringify(appointmentData)
    }
)


const data = await response.json().catch(() => null)

if (!response.ok) {
    throw new Error(
        data?.message || data?.error || 'Failed to create appointment.'
    )
}

return data


}
