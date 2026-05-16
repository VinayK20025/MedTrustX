local _M = {
  version = "1.0",
  priority = 999,
  name = "tenant-injector"
}

function _M.access(plugin_conf)
  local headers = kong.request.get_headers()
  local tenant_id = headers["x-tenant-id"]

  if not tenant_id or tenant_id == "" then
    return kong.response.exit(400, { message = "Missing Tenant ID in request context" })
  end

  kong.service.request.set_header("X-MedTrust-Tenant", tenant_id)
end

return _M
