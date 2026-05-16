"""
OpenTelemetry Tracing configuration.
"""
from opentelemetry import trace
from opentelemetry.sdk.resources import Resource, SERVICE_NAME
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

from app.config import settings

def setup_tracing(app):
    resource = Resource.create(attributes={
        SERVICE_NAME: settings.otel_service_name
    })
    
    provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(provider)
    
    otlp_exporter = OTLPSpanExporter(endpoint=settings.otel_exporter_otlp_endpoint)
    provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
    
    FastAPIInstrumentor.instrument_app(app)
    HTTPXClientInstrumentor().instrument()
