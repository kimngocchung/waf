export interface LogMessage {
  message: string;
  details: {
    match: string;
    reference: string;
    ruleId: string;
    file: string;
    lineNumber: string;
    data: string;
    severity: string;
    ver: string;
    rev: string;
    tags: string[];
    maturity: string;
    accuracy: string;
  };
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface LogEntry {
  transaction: {
    client_ip: string;
    time_stamp: string;
    server_id: string;
    client_port: number;
    host_ip: string;
    host_port: number;
    unique_id: string;
    request: {
      method: HttpMethod;
      http_version: number;
      uri: string;
      headers: {
        Host: string;
        'User-Agent': string;
        Accept: string;
        [key: string]: string;
      };
    };
    response: {
      body: string;
      http_code: number;
      headers: Record<string, unknown>;
    };
    producer: {
      modsecurity: string;
      connector: string;
      secrules_engine: string;
      components: string[];
    };
    messages: LogMessage[];
  };
}
