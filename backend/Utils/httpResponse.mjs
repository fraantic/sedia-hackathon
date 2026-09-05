export default function httpResponse(status, message, data, res) {
  return res.status(status).json({
    message,
    data,
  })
} 