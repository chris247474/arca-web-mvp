import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Hr,
  Section,
} from "@react-email/components";

export interface ApplicationApprovedEmailProps {
  applicantName: string;
  groupName: string;
  groupUrl: string;
}

export function ApplicationApprovedEmail({
  applicantName,
  groupName,
  groupUrl,
}: ApplicationApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.heading}>Welcome to {groupName}!</Text>

          <Text style={styles.text}>Hi {applicantName},</Text>

          <Text style={styles.text}>
            Great news! Your application to join <strong>{groupName}</strong>{" "}
            has been approved.
          </Text>

          <Text style={styles.text}>
            You now have full access to view deals, documents, and participate
            in discussions with other group members.
          </Text>

          <Hr style={styles.hr} />

          <Section style={styles.buttonSection}>
            <Button style={styles.button} href={groupUrl}>
              View Group
            </Button>
          </Section>

          <Text style={styles.footer}>
            Welcome to the community. We look forward to your participation!
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
    color: "#16a34a",
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
  buttonSection: {
    textAlign: "center" as const,
    margin: "24px 0",
  },
  button: {
    backgroundColor: "#16a34a",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600" as const,
    textDecoration: "none",
    textAlign: "center" as const,
    padding: "12px 24px",
  },
  footer: {
    fontSize: "14px",
    color: "#6b7280",
    textAlign: "center" as const,
    margin: "24px 0 0",
  },
};

export default ApplicationApprovedEmail;
