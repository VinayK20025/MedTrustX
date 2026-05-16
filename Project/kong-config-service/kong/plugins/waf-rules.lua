local _M = {
  version = "1.0",
  priority = 1001,
  name = "waf-rules"
}

function _M.access(plugin_conf)
  local args = kong.request.get_query()
  local path = kong.request.get_path()

  local sqli_patterns = {
    "'.*OR.*1=1",
    "UNION%s+SELECT",
    "DROP%s+TABLE",
    "INSERT%s+INTO",
    "%-%-comment",
    "xp_cmdshell"
  }

  local xss_patterns = {
    "<script>",
    "javascript:",
    "onerror="
  }

  local path_patterns = {
    "%.%./",
    "%.%./%.%./"
  }

  local cmd_patterns = {
    ";%s*rm",
    "|%s*cat",
    "&%s*wget"
  }

  for k, v in pairs(args) do
    if type(v) == "string" then
      for _, p in ipairs(sqli_patterns) do
        if string.match(string.upper(v), p) or string.match(v, p) then
          return kong.response.exit(400, { message = "Blocked by WAF" }, { ["X-WAF-Rule"] = "SQLI_001" })
        end
      end
      for _, p in ipairs(xss_patterns) do
        if string.match(string.lower(v), p) then
          return kong.response.exit(400, { message = "Blocked by WAF" }, { ["X-WAF-Rule"] = "XSS_001" })
        end
      end
      for _, p in ipairs(cmd_patterns) do
        if string.match(string.lower(v), p) then
          return kong.response.exit(400, { message = "Blocked by WAF" }, { ["X-WAF-Rule"] = "CMD_001" })
        end
      end
    end
  end

  for _, p in ipairs(path_patterns) do
    if string.match(path, p) then
      return kong.response.exit(400, { message = "Blocked by WAF" }, { ["X-WAF-Rule"] = "PATH_001" })
    end
  end
end

return _M
