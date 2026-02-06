import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Hr,
  Section,
  Link,
} from "@react-email/components";

export interface ApplicationSubmittedEmailProps {
  curatorName: string;
  applicantName: string;
  applicantEmail: string;
  groupName: string;
  linkedinUrl: string;
  interestStatement: string;
  reviewUrl: string;
}

export function ApplicationSubmittedEmail({
  curatorName,
  applicantName,
  applicantEmail,
  groupName,
  linkedinUrl,
  interestStatement,
  reviewUrl,
}: ApplicationSubmittedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.heading}>New Application Received</Text>

          <Text style={styles.text}>Hi {curatorName},</Text>

          <Text style={styles.text}>
            Someone has applied to join your group <strong>{groupName}</strong>.
          </Text>

          <Hr style={styles.hr} />

          <Section style={styles.section}>
            <Text style={styles.label}>Applicant</Text>
            <Text style={styles.value}>{applicantName}</Text>

            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{applicantEmail}</Text>

            <Text style={styles.label}>LinkedIn</Text>
            <Text style={styles.value}>
              <Link href={linkedinUrl} style={styles.link}>
                {linkedinUrl}
              </Link>
            </Text>

            <Text style={styles.label}>Interest Statement</Text>
            <Text style={styles.value}>{interestStatement}</Text>
          </Section>

          <Hr style={styles.hr} />

          <Section style={styles.buttonSection}>
            <Button style={styles.button} href={reviewUrl}>
              Review Application
            </Button>
          </Section>

          <Text style={styles.footer}>
            You are receiving this email because you are a curator on ArCa.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "40px 20px",
    maxWidth: "560px",
    borderRadius: "8px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    color: "#1a1a1a",
    margin: "0 0 30px",
  },
  text: {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#4a4a4a",
    margin: "0 0 16px",
  },
  hr: {
    borderColor: "#e6e6e6",
    margin: "24px 0",
  },
  section: {
    padding: "0",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    color: "#6b7280",
    margin: "0 0 4px",
  },
  value: {
    fontSize: "16px",
    color: "#1a1a1a",
    margin: "0 0 16px",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
  buttonSection: {
    textAlign: "center" as const,
    margin: "24px 0",
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600" as const,
    textDecoration: "none",
    textAlign: "center" as const,
    padding: "12px 24px",
  },
  footer: {
    fontSize: "12px",
    color: "#9ca3af",
    textAlign: "center" as const,
    margin: "24px 0 0",
  },
};

export default ApplicationSubmittedEmail;
