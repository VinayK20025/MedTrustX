local _M = {
  version = "1.0",
  priority = 1000,
  name = "pqc-auth"
}

function _M.access(plugin_conf)
  local headers = kong.request.get_headers()
  local auth_header = headers["authorization"]
  local pqc_proof = headers["x-pqc-proof"]

  if not auth_header then
    return kong.response.exit(401, { message = "Missing Authorization header" })
  end

  local token = auth_header:match("^Bearer%s+(.+)")
  if not token then
    return kong.response.exit(401, { message = "Invalid Authorization header" })
  end

  if not pqc_proof then
    return kong.response.exit(401, { message = "Missing X-PQC-Proof header" })
  end

  local tenant_id = "tenant_general"
  local user_id = "user_123"
  local role = "practitioner"

  kong.service.request.set_header("X-User-ID", user_id)
  kong.service.request.set_header("X-Tenant-ID", tenant_id)
  kong.service.request.set_header("X-User-Role", role)
end

return _M
