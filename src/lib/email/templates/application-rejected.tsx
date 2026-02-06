import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Hr,
} from "@react-email/components";

export interface ApplicationRejectedEmailProps {
  applicantName: string;
  groupName: string;
}

export function ApplicationRejectedEmail({
  applicantName,
  groupName,
}: ApplicationRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.heading}>Application Update</Text>

          <Text style={styles.text}>Hi {applicantName},</Text>

          <Text style={styles.text}>
            Thank you for your interest in joining <strong>{groupName}</strong>.
          </Text>

          <Text style={styles.text}>
            After careful consideration, we are unable to approve your
            application at this time. This decision may be based on various
            factors including group capacity or fit with the current member
            profile.
          </Text>

          <Hr style={styles.hr} />

          <Text style={styles.text}>
            We encourage you to explore other groups on ArCa that may be a
            better match for your interests and expertise.
          </Text>

          <Text style={styles.footer}>
            Thank you for your understanding.
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
  footer: {
    fontSize: "14px",
    color: "#6b7280",
    textAlign: "center" as const,
    margin: "24px 0 0",
  },
};

export default ApplicationRejectedEmail;
