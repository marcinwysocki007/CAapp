import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
  },
});

interface SimpleProps {
  kalkulation: any;
  leadData?: {
    vorname?: string;
    nachname?: string;
    email?: string;
  };
}

export const SimplePDFDocument = ({ kalkulation, leadData }: SimpleProps) => {
  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount || 0);
  };

  let eigenanteil = 0;
  let bruttopreis = 0;
  let zuschuesseGesamt = 0;

  try {
    if ('totalGross' in kalkulation) {
      bruttopreis = kalkulation.totalGross || 0;
      eigenanteil = kalkulation.eigenanteil || 0;
      zuschuesseGesamt = Math.max(0, bruttopreis - eigenanteil);
    } else if ('bruttopreis' in kalkulation) {
      bruttopreis = kalkulation.bruttopreis || 0;
      eigenanteil = kalkulation.eigenanteil || 0;
      zuschuesseGesamt = kalkulation.zuschüsse?.gesamt || 0;
    }
  } catch (e) {
    console.error('Fehler beim Parsen der Kalkulation:', e);
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Primundus 24h-Pflege</Text>
        <Text style={styles.text}>Kostenübersicht</Text>

        {leadData?.vorname && (
          <Text style={styles.text}>
            Für: {leadData.vorname} {leadData.nachname || ''}
          </Text>
        )}

        <View style={{ marginTop: 30 }}>
          <Text style={styles.text}>Bruttopreis: {formatEuro(bruttopreis)}</Text>
          <Text style={styles.text}>Zuschüsse: -{formatEuro(zuschuesseGesamt)}</Text>
          <Text style={[styles.text, { fontSize: 16, fontWeight: 'bold', marginTop: 10 }]}>
            Ihr Eigenanteil: {formatEuro(eigenanteil)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
