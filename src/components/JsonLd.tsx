/* Rendert strukturierte Daten (JSON-LD) als <script>-Tag.
   Server-tauglich, ein oder mehrere Schema-Objekte möglich. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
