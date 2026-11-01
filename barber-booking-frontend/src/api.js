const API_BASE_URL = "http://localhost:9090/api";

async function request(endpoint, options = {}) {
    const token = localStorage.getItem("token");


const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    },
});

const text = await response.text();

let data = null;

if (text) {
    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }
}

if (!response.ok) {
    const message =
        typeof data === "string"
            ? data
            : data?.message || data?.error || "Something went wrong.";

    throw new Error(message);
}

return data;


}

// SHOP

export function getShop(shopId) {
    return request(`/shops/${shopId}`);
}

// SERVICES

export function getShopServices(shopId) {
    return request(`/shops/${shopId}/services`);
}

// AVAILABILITY

export function getAvailability(
    shopId,
    date,
    adultServiceIds = [],
    childServiceIds = [],
    adultCount = 1,
    childCount = 0
) {
    const params = new URLSearchParams();


params.append("date", date);
params.append("adultCount", adultCount);
params.append("childCount", childCount);

adultServiceIds.forEach((id) => {
    params.append("adultServiceIds", id);
});

childServiceIds.forEach((id) => {
    params.append("childServiceIds", id);
});

return request(
    `/shops/${shopId}/availability?${params.toString()}`
);


}

// CUSTOMER BOOKING

export function createAppointment(shopId, appointmentData) {
return request(`/shops/${shopId}/appointments`, {
    method: "POST",
        body: JSON.stringify(appointmentData),
});
}

// BARBER LOGIN

export function loginBarber(email, password) {
    return request("/test/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

// BARBER APPOINTMENT MANAGEMENT

export function getAppointments(shopId) {
    return request(`/shops/${shopId}/appointments`);
}

export function getAppointment(shopId, appointmentId) {
    return request(
        `/shops/${shopId}/appointments/${appointmentId}`
    );
}

export function confirmAppointment(shopId, appointmentId) {
    return request(
        `/shops/${shopId}/appointments/${appointmentId}/confirm`,
        { method: "PATCH" }
    );
}

export function cancelAppointment(shopId, appointmentId) {
    return request(
        `/shops/${shopId}/appointments/${appointmentId}/cancel`,
        { method: "PATCH" }
    );
}

export function completeAppointment(shopId, appointmentId) {
    return request(
        `/shops/${shopId}/appointments/${appointmentId}/complete`,
        { method: "PATCH" }
    );
}
