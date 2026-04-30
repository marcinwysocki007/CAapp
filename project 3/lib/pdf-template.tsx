import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Kalkulation } from './calculation';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: '2 solid #8B7355',
  },
  logo: {
    width: 120,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3D3D3D',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#8B8B8B',
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3D3D3D',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceBox: {
    backgroundColor: '#8B7355',
    padding: 20,
    borderRadius: 8,
    marginBottom: 25,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  priceUnit: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: '#F8F7F5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottom: '1 solid #E5E3DF',
  },
  rowLast: {
    borderBottom: 'none',
  },
  rowLabel: {
    fontSize: 11,
    color: '#5D5D5D',
  },
  rowValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3D3D3D',
  },
  subsidyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottom: '1 solid #E5E3DF',
  },
  subsidyLabel: {
    fontSize: 10,
    color: '#5D5D5D',
  },
  subsidyValue: {
    fontSize: 10,
    color: '#2D7D2D',
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTop: '2 solid #3D3D3D',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3D3D3D',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D7D2D',
  },
  note: {
    fontSize: 9,
    color: '#8B8B8B',
    fontStyle: 'italic',
    marginTop: 10,
  },
  infoBox: {
    backgroundColor: '#FFF8E7',
    padding: 12,
    borderRadius: 6,
    borderLeft: '3 solid #8B7355',
    marginTop: 15,
  },
  infoText: {
    fontSize: 9,
    color: '#5D5D5D',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTop: '1 solid #E5E3DF',
  },
  footerText: {
    fontSize: 8,
    color: '#8B8B8B',
    textAlign: 'center',
  },
});

interface PDFTemplateProps {
  kalkulation: Kalkulation | any;
  leadData?: {
    vorname?: string;
    nachname?: string;
    email?: string;
  };
}

export const KalkulationPDFDocument = ({ kalkulation, leadData }: PDFTemplateProps) => {
  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isOldFormat = (kal: any): boolean => {
    return 'totalGross' in kal || 'taxBenefit' in kal || 'pflegegeld' in kal;
  };

  const normalizeData = (kal: any) => {
    if (isOldFormat(kal)) {
      const eigenanteil = kal.eigenanteil || 0;
      const totalGross = kal.totalGross || 0;
      const zuschuesseGesamt = Math.max(0, totalGross - eigenanteil);

      const items = [];
      if (kal.pflegegeld && kal.pflegegeld > 0) {
        items.push({
          label: `Pflegegeld Pflegegrad ${kal.pflegegradUsed || ''}`,
          beschreibung: 'Pflegegeld der Pflegekasse',
          betrag_monatlich: kal.pflegegeld,
          in_kalkulation: true,
        });
      }
      if (kal.taxBenefit && kal.taxBenefit > 0) {
        items.push({
          label: 'Steuervorteil',
          beschreibung: 'Steuerliche Absetzbarkeit',
          betrag_monatlich: kal.taxBenefit,
          in_kalkulation: true,
        });
      }

      return {
        bruttopreis: totalGross,
        eigenanteil,
        zuschüsse: {
          items,
          gesamt: zuschuesseGesamt,
        },
        aufschluesselung: [],
      };
    }

    const zuschüsse = kal.zuschüsse || {};
    return {
      bruttopreis: kal.bruttopreis || 0,
      eigenanteil: kal.eigenanteil || 0,
      zuschüsse: {
        items: Array.isArray(zuschüsse.items) ? zuschüsse.items : [],
        gesamt: typeof zuschüsse.gesamt === 'number' ? zuschüsse.gesamt : 0,
      },
      aufschluesselung: Array.isArray(kal.aufschluesselung) ? kal.aufschluesselung : [],
    };
  };

  const data = normalizeData(kalkulation);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Primundus</Text>
            <Text style={{ fontSize: 10, color: '#8B8B8B' }}>24h-Pflege & Betreuung</Text>
          </View>
          <View>
            <Text style={{ fontSize: 9, color: '#8B8B8B', textAlign: 'right' }}>
              Erstellt am: {formatDate()}
            </Text>
            {leadData?.vorname && (
              <Text style={{ fontSize: 9, color: '#8B8B8B', textAlign: 'right', marginTop: 3 }}>
                {leadData.vorname} {leadData.nachname || ''}
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.title}>Ihre persönliche Kostenübersicht</Text>
        <Text style={styles.subtitle}>Basierend auf Ihren Angaben berechnet</Text>

        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Ihr monatlicher Eigenanteil</Text>
          <Text style={styles.priceAmount}>{formatEuro(data.eigenanteil)}</Text>
          <Text style={styles.priceUnit}>pro Monat</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kostenaufstellung</Text>
          <View style={styles.detailsBox}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Bruttopreis</Text>
              <Text style={styles.rowValue}>{formatEuro(data.bruttopreis)}</Text>
            </View>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={[styles.rowLabel, { color: '#2D7D2D', fontWeight: 'bold' }]}>
                Zuschüsse gesamt
              </Text>
              <Text style={[styles.rowValue, { color: '#2D7D2D' }]}>
                − {formatEuro(data.zuschüsse.gesamt)}
              </Text>
            </View>
          </View>
          <Text style={styles.note}>
            Zzgl. Kost & Logis, Fahrtkosten sowie Feiertagszuschläge
          </Text>
        </View>

        {data.zuschüsse.items && data.zuschüsse.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ihre Zuschüsse & Förderungen</Text>
            <View style={styles.detailsBox}>
              {data.zuschüsse.items.map((zuschuss: any, index: number) => (
                <View
                  key={index}
                  style={
                    index === data.zuschüsse.items.length - 1
                      ? [styles.subsidyRow, styles.rowLast]
                      : styles.subsidyRow
                  }
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subsidyLabel}>{zuschuss.label}</Text>
                    {zuschuss.beschreibung && (
                      <Text style={{ fontSize: 8, color: '#8B8B8B', marginTop: 2 }}>
                        {zuschuss.beschreibung}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.subsidyValue}>
                    {formatEuro(zuschuss.betrag_monatlich)}
                    {zuschuss.in_kalkulation && ' ✓'}
                  </Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Entlastung gesamt (monatlich)</Text>
                <Text style={styles.totalValue}>
                  − {formatEuro(data.zuschüsse.gesamt)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {data.aufschluesselung && data.aufschluesselung.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ihre Situation</Text>
            <View style={styles.detailsBox}>
              {data.aufschluesselung
                .filter((item: any) => item && item.kategorie && item.label)
                .map((item: any, index: number, filteredArray: any[]) => (
                <View
                  key={index}
                  style={
                    index === filteredArray.length - 1
                      ? [styles.subsidyRow, styles.rowLast]
                      : styles.subsidyRow
                  }
                >
                  <Text style={styles.subsidyLabel}>{item.kategorie}</Text>
                  <Text style={styles.rowValue}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ✓ Keine versteckten Kosten • Täglich kündbar • Sie zahlen nur für geleistete Tage
          </Text>
          <Text style={[styles.infoText, { marginTop: 5 }]}>
            ✓ Alle Zuschüsse sind bereits berücksichtigt • Kostenlose Beratung inklusive
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Primundus GmbH • 24h-Pflege und Betreuung
          </Text>
          <Text style={[styles.footerText, { marginTop: 3 }]}>
            Telefon: 0800 724 0000 • E-Mail: info@primundus.de • www.primundus.de
          </Text>
        </View>
      </Page>
    </Document>
  );
};
