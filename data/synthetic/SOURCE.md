# Synthea provenance

MedTrustX uses the Synthea synthetic patient generator as the upstream source for synthetic clinical records.

Official source: https://github.com/synthetichealth/synthea

The official Synthea documentation states that it can export patient records in CSV format and supports population generation with the `run_synthea -p <populationSize>` command. The current Synthea README specifies Java JDK 17 or newer.

Recommended provenance statement for the manuscript:

> Synthetic patient records were generated using the Synthea Patient Generator (official repository: https://github.com/synthetichealth/synthea). The generated records are synthetic and do not correspond to real individuals. Downstream MedTrustX risk labels were derived computationally from the synthetic records and should not be interpreted as observed clinical outcomes.
