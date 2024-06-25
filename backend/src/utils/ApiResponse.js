class ApiResponse {
  constructor(data = null, message = null) {
    this.status = "success"; // Status indicating successful response
    this.data = data; // Response data
    this.message = message; // Optional message
  }
}

export { ApiResponse };
