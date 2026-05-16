local http = require "resty.http"
local cjson = require "cjson.safe"

local _M = {
  version = "1.0",
  priority = 998,
  name = "threat-logger"
}

local function log_threat(threat_type, ip)
  local httpc = http.new()
  local res, err = httpc:request_uri("http://kong-config-service:8021/api/gateway/threats/internal", {
    method = "POST",
    body = cjson.encode({
      threat_type = threat_type,
      source_ip = ip
    }),
    headers = {
      ["Content-Type"] = "application/json",
    }
  })
end

function _M.header_filter(plugin_conf)
  local status = kong.response.get_status()
  local ip = kong.client.get_ip()

  if status == 429 then
    kong.log.err("Rate limit exceeded for IP: ", ip)
    ngx.timer.at(0, function(premature)
      if premature then return end
      log_threat("rate_limit_violation", ip)
    end)
  end

  if status == 401 then
    kong.log.err("Auth failed for IP: ", ip)
    ngx.timer.at(0, function(premature)
      if premature then return end
      log_threat("failed_auth", ip)
    end)
  end
end

return _M
