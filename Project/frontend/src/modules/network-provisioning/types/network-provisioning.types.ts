export interface Network {
  id: string;
  name: string;
  cidr: string;
  status: string;
}

export interface Subnet {
  id: string;
  network_id: string;
  cidr: string;
  status: string;
}

export interface IPAllocation {
  id: string;
  subnet_id: string;
  ip_address: string;
  assigned_to: string;
  status: string;
}

export interface NetworkDevice {
  id: string;
  device_id: string;
  config: Record<string, any>;
  status: string;
}
