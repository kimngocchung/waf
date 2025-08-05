import type { LogEntry } from './types';

export const logData: LogEntry[] = [
  {
    "transaction": {
      "client_ip": "192.168.1.101",
      "time_stamp": "Wed Apr 23 22:15:00 2025",
      "server_id": "a1b2c3d4e5f6",
      "client_port": 51234,
      "host_ip": "10.0.0.5",
      "host_port": 80,
      "unique_id": "17454609004.922163",
      "request": {
        "method": "GET",
        "http_version": 1.1,
        "uri": "/login.php?user=admin' OR '1'='1",
        "headers": {
          "Host": "secure-app.com",
          "User-Agent": "curl/8.13.0",
          "Accept": "*/*"
        }
      },
      "response": { "body": "", "http_code": 403, "headers": {} },
      "producer": {
        "modsecurity": "ModSecurity v3.0.14 (Linux)",
        "connector": "ModSecurity-nginx v1.0.3",
        "secrules_engine": "Enabled",
        "components": ["OWASP_CRS/4.14.0-dev"]
      },
      "messages": [{
        "message": "SQL Injection Attack Detected via libinjection",
        "details": {
          "match": "Matched 'Operator `Rx' with parameter `(?i:(?:(?:'|\\/|\\(|\\)|\\d|\\w|-|\\!|\\<|\\>|\\=)+\\s*(?:and|or|xor|like|between|rpad|lpad|instr|soundex|bit_count|round|ceil|floor|rand|conv|concat|char|ascii|abs|substr|substring|mid|len|length|... (1265 more characters))' against variable `ARGS:user' (Value: `admin' or '1'='1' )",
          "reference": "",
          "ruleId": "942100",
          "file": "/etc/nginx/modsec/coreruleset/rules/REQUEST-942-APPLICATION-ATTACK-SQLI.conf",
          "lineNumber": "46",
          "data": "Matched Data: ' or '1'='1 found within ARGS:user: admin' or '1'='1",
          "severity": "2",
          "ver": "OWASP_CRS/4.0.0",
          "rev": "",
          "tags": ["application-multi", "language-multi", "platform-multi", "attack-sqli", "paranoia-level/1", "OWASP_CRS"],
          "maturity": "0",
          "accuracy": "0"
        }
      }]
    }
  },
  {
    "transaction": {
      "client_ip": "172.16.0.42",
      "time_stamp": "Wed Apr 23 22:18:30 2025",
      "server_id": "a1b2c3d4e5f6",
      "client_port": 51235,
      "host_ip": "10.0.0.5",
      "host_port": 80,
      "unique_id": "17454611101.123456",
      "request": {
        "method": "GET",
        "http_version": 1.1,
        "uri": "/search?q=<script>alert('XSS')</script>",
        "headers": {
          "Host": "secure-app.com",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
          "Accept": "text/html"
        }
      },
      "response": { "body": "", "http_code": 403, "headers": {} },
      "producer": {
        "modsecurity": "ModSecurity v3.0.14 (Linux)",
        "connector": "ModSecurity-nginx v1.0.3",
        "secrules_engine": "Enabled",
        "components": ["OWASP_CRS/4.14.0-dev"]
      },
      "messages": [{
        "message": "Cross-site Scripting (XSS) Attack",
        "details": {
          "match": "Matched 'Operator `rx' with parameter `(?i:<(?:a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdi|bdo|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|data|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h[1-6]|head|header|hr|html|i|iframe|img|input|ins|kbd|label|legend|li|link|main|map|mark|meta|meter|nav|nobr|noembed|noframes|noscript|object|ol|optgroup|option|output|p|param|picture|plaintext|pre|progress|q|rb|rp|rt|rtc|ruby|s|samp|script|section|select|small|source|span|strike|strong|style|sub|summary|sup|svg|table|tbody|td|template|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video|wbr|xmp)(?:[\\s\\/].*)?>)' against variable `ARGS:q' (Value: `<script>alert('XSS')</script>' )",
          "reference": "",
          "ruleId": "941100",
          "file": "/etc/nginx/modsec/coreruleset/rules/REQUEST-941-APPLICATION-ATTACK-XSS.conf",
          "lineNumber": "54",
          "data": "Matched Data: <script> found within ARGS:q: <script>alert('XSS')</script>",
          "severity": "2",
          "ver": "OWASP_CRS/4.0.0",
          "rev": "",
          "tags": ["application-multi", "language-multi", "platform-multi", "attack-xss", "paranoia-level/1", "OWASP_CRS"],
          "maturity": "0",
          "accuracy": "0"
        }
      }]
    }
  },
  {
    "transaction": {
      "client_ip": "203.0.113.75",
      "time_stamp": "Wed Apr 23 22:20:05 2025",
      "server_id": "a1b2c3d4e5f6",
      "client_port": 51236,
      "host_ip": "10.0.0.5",
      "host_port": 80,
      "unique_id": "17454612052.789012",
      "request": {
        "method": "GET",
        "http_version": 1.1,
        "uri": "/index.html",
        "headers": {
          "Host": "secure-app.com",
          "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
          "Accept": "text/html"
        }
      },
      "response": { "body": "<html>...</html>", "http_code": 200, "headers": {} },
      "producer": {
        "modsecurity": "ModSecurity v3.0.14 (Linux)",
        "connector": "ModSecurity-nginx v1.0.3",
        "secrules_engine": "Enabled",
        "components": ["OWASP_CRS/4.14.0-dev"]
      },
      "messages": []
    }
  },
  {
    "transaction": {
      "client_ip": "198.51.100.10",
      "time_stamp": "Wed Apr 23 22:21:45 2025",
      "server_id": "a1b2c3d4e5f6",
      "client_port": 51237,
      "host_ip": "10.0.0.5",
      "host_port": 80,
      "unique_id": "17454613053.123123",
      "request": {
        "method": "GET",
        "http_version": 1.1,
        "uri": "/?file=../../../../etc/passwd",
        "headers": {
          "Host": "secure-app.com",
          "User-Agent": "Nikto",
          "Accept": "*/*"
        }
      },
      "response": { "body": "", "http_code": 403, "headers": {} },
      "producer": {
        "modsecurity": "ModSecurity v3.0.14 (Linux)",
        "connector": "ModSecurity-nginx v1.0.3",
        "secrules_engine": "Enabled",
        "components": ["OWASP_CRS/4.14.0-dev"]
      },
      "messages": [{
        "message": "Path Traversal Attack (/../)",
        "details": {
          "match": "Matched 'Operator `rx' with parameter `(?:\\.\\.(?:\\\\|\\/)|%(?:25)?2e%(?:25)?2e(?:%(?:25)?5c|%(?:25)?2f))' against variable `ARGS:file' (Value: `../../../../etc/passwd' )",
          "reference": "",
          "ruleId": "930120",
          "file": "/etc/nginx/modsec/coreruleset/rules/REQUEST-930-APPLICATION-ATTACK-LFI.conf",
          "lineNumber": "92",
          "data": "Matched Data: ../ found within ARGS:file: ../../../../etc/passwd",
          "severity": "2",
          "ver": "OWASP_CRS/4.0.0",
          "rev": "",
          "tags": ["application-multi", "language-multi", "platform-multi", "attack-lfi", "paranoia-level/1", "OWASP_CRS", "capec/1000/255/126"],
          "maturity": "0",
          "accuracy": "0"
        }
      }]
    }
  },
  {
    "transaction": {
      "client_ip": "192.168.1.101",
      "time_stamp": "Wed Apr 23 22:25:10 2025",
      "server_id": "a1b2c3d4e5f6",
      "client_port": 51238,
      "host_ip": "10.0.0.5",
      "host_port": 80,
      "unique_id": "17454615104.456789",
      "request": {
        "method": "POST",
        "http_version": 1.1,
        "uri": "/api/users",
        "headers": {
          "Host": "secure-app.com",
          "User-Agent": "PostmanRuntime/7.29.0",
          "Accept": "*/*",
          "Content-Type": "application/json"
        }
      },
      "response": { "body": "{\"status\":\"created\"}", "http_code": 201, "headers": {} },
      "producer": {
        "modsecurity": "ModSecurity v3.0.14 (Linux)",
        "connector": "ModSecurity-nginx v1.0.3",
        "secrules_engine": "Enabled",
        "components": ["OWASP_CRS/4.14.0-dev"]
      },
      "messages": []
    }
  }
]
