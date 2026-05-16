import type { ThreatIntelData } from '../types/threat-intel.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockData: ThreatIntelData = {
  metrics: {
    activeThreats: 34,
    totalIocs: 12480,
    feedUpdatesToday: 47,
    detectionCoverage: 94.8,
    correlationMatches: 19,
  },
  indicators: [
    { id: 'IOC-TI-001', indicatorValue: '185.220.101.44', type: 'IP Address', riskScore: 98, source: 'CrowdStrike Falcon', firstSeen: t(-604800), lastSeen: t(-120), tags: ['C2', 'APT28', 'Cobalt Strike'], enrichment: 'Known C2 Server — APT28 Fancy Bear' },
    { id: 'IOC-TI-002', indicatorValue: 'a3f5b2c8d1e4f7a6b9c0d2e3f4a5b6c7', type: 'File Hash', riskScore: 100, source: 'VirusTotal', firstSeen: t(-259200), lastSeen: t(-3600), tags: ['Ransomware', 'LockBit 3.0'], enrichment: 'LockBit 3.0 Ransomware Dropper' },
    { id: 'IOC-TI-003', indicatorValue: 'malware-c2.evil-domain.xyz', type: 'Domain', riskScore: 92, source: 'AlienVault OTX', firstSeen: t(-432000), lastSeen: t(-7200), tags: ['Phishing', 'Credential Theft'] },
    { id: 'IOC-TI-004', indicatorValue: 'CVE-2024-21762', type: 'CVE', riskScore: 95, source: 'NVD / CISA KEV', firstSeen: t(-1209600), lastSeen: t(-86400), tags: ['FortiOS', 'RCE', 'Critical'], enrichment: 'FortiOS SSL VPN Pre-Auth RCE — Actively Exploited' },
    { id: 'IOC-TI-005', indicatorValue: 'phishing@fake-hospital.com', type: 'Email', riskScore: 78, source: 'Internal Honeypot', firstSeen: t(-172800), lastSeen: t(-43200), tags: ['Phishing', 'Social Engineering'] },
  ],
  campaigns: [
    { id: 'CAM-001', campaignName: 'Operation MedLock', adversary: 'LockBit Affiliate', status: 'Active', ttps: ['T1566.001', 'T1059.001', 'T1486'], iocCount: 42, targetSector: 'Healthcare', firstObserved: t(-2592000), lastActivity: t(-3600) },
    { id: 'CAM-002', campaignName: 'Fancy Bear EHR Recon', adversary: 'APT28', status: 'Emerging', ttps: ['T1190', 'T1078', 'T1071.001'], iocCount: 18, targetSector: 'Healthcare / Government', firstObserved: t(-604800), lastActivity: t(-86400) },
    { id: 'CAM-003', campaignName: 'Credential Harvest Wave', adversary: 'FIN7', status: 'Dormant', ttps: ['T1566.002', 'T1534', 'T1110'], iocCount: 95, targetSector: 'Healthcare / Finance', firstObserved: t(-7776000), lastActivity: t(-2592000) },
  ],
  feeds: [
    { id: 'FEED-01', feedName: 'CrowdStrike Threat Graph', provider: 'CrowdStrike', type: 'Commercial', status: 'Active', iocIngested: 4500, lastUpdate: t(-1800), updateFrequency: 'Every 15 min' },
    { id: 'FEED-02', feedName: 'AlienVault OTX', provider: 'AT&T Cybersecurity', type: 'OSINT', status: 'Active', iocIngested: 3200, lastUpdate: t(-3600), updateFrequency: 'Hourly' },
    { id: 'FEED-03', feedName: 'CISA KEV Catalog', provider: 'CISA', type: 'Government', status: 'Active', iocIngested: 1100, lastUpdate: t(-7200), updateFrequency: 'Daily' },
    { id: 'FEED-04', feedName: 'Dark Web Intelligence', provider: 'Recorded Future', type: 'Dark Web', status: 'Active', iocIngested: 2800, lastUpdate: t(-5400), updateFrequency: 'Every 30 min' },
    { id: 'FEED-05', feedName: 'Internal Honeypot Network', provider: 'MedTrustX SOC', type: 'Internal', status: 'Active', iocIngested: 880, lastUpdate: t(-600), updateFrequency: 'Real-time' },
  ],
  correlations: [
    { id: 'COR-01', internalEvent: 'Outbound 4.2GB to 45.33.22.11', internalSource: 'Firewall Logs', externalThreat: 'APT28 C2 Infrastructure', matchedIoc: '185.220.101.44', confidence: 96, timestamp: t(-300) },
    { id: 'COR-02', internalEvent: 'Malware Hash Match on ER-NURSE-04', internalSource: 'EDR Falcon', externalThreat: 'LockBit 3.0 Ransomware', matchedIoc: 'a3f5b2c8d1e4...', confidence: 100, timestamp: t(-3600) },
    { id: 'COR-03', internalEvent: 'FortiOS VPN Exploit Attempt', internalSource: 'IDS Alert', externalThreat: 'CVE-2024-21762 Active Exploitation', matchedIoc: 'CVE-2024-21762', confidence: 92, timestamp: t(-7200) },
  ],
  detectionRules: [
    { id: 'DET-01', ruleName: 'Block APT28 C2 IPs', targetSystem: 'Firewall', linkedIocs: 12, status: 'Enabled', lastPushed: t(-1800), hitCount: 78 },
    { id: 'DET-02', ruleName: 'LockBit Hash Detection', targetSystem: 'EDR', linkedIocs: 8, status: 'Enabled', lastPushed: t(-3600), hitCount: 3 },
    { id: 'DET-03', ruleName: 'Phishing Domain Blocklist', targetSystem: 'SIEM', linkedIocs: 45, status: 'Enabled', lastPushed: t(-7200), hitCount: 142 },
    { id: 'DET-04', ruleName: 'FortiOS CVE Exploit Pattern', targetSystem: 'IDS/IPS', linkedIocs: 4, status: 'Testing', lastPushed: t(-86400), hitCount: 0 },
  ]
};

export const threatIntelApi = {
  getData: async () => ({ data: mockData, message: 'Success', status: 200 }),
  pushDetectionRule: async (ruleId: string) => ({ data: { success: true }, message: 'Rule Pushed to Detection System', status: 200 }),
  enrichIoc: async (iocId: string) => ({ data: { success: true }, message: 'IOC Enriched', status: 200 }),
  toggleFeed: async (feedId: string) => ({ data: { success: true }, message: 'Feed Toggled', status: 200 }),
};
