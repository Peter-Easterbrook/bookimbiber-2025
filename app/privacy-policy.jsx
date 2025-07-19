import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Spacer from '../components/Spacer';
import ThemedText from '../components/ThemedText';
import ThemedView from '../components/ThemedView';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';

export default function PrivacyPolicy() {
  const router = useRouter();
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        style={{ backgroundColor: theme.navBackground }}
        edges={['top']}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back-circle-outline"
              size={24}
              color={theme.iconColor}
            />
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.title} title={true}>
          PRIVACY POLICY
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Last updated July 17, 2025
        </ThemedText>

        <Spacer height={20} />

        <ThemedText style={styles.paragraph}>
          This Privacy Notice for OneStepWeb ('we', 'us', or 'our'), describes
          how and why we might access, collect, store, use, and/or share
          ('process') your personal information when you use our services
          ('Services'), including when you:
        </ThemedText>

        <View style={styles.listContainer}>
          <ThemedText style={styles.listItem}>
            • Download and use our mobile application (Book Imbiber), or any
            other application of ours that links to this Privacy Notice
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • Use Book Imbiber. Book Imbiber is a personal book tracking
            application that allows users to manage their reading collection.
            The app helps readers catalogue books they've read or want to read,
            search for new books via Google Books API, and track their reading
            history.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • Engage with us in other related ways, including any sales,
            marketing, or events
          </ThemedText>
        </View>

        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.bold}>Questions or concerns? </ThemedText>
          Reading this Privacy Notice will help you understand your privacy
          rights and choices. We are responsible for making decisions about how
          your personal information is processed. If you do not agree with our
          policies and practices, please do not use our Services. If you still
          have any questions or concerns, please contact us at
          peter@onestepweb.dev.
        </ThemedText>

        <Spacer height={10} />

        <ThemedText style={styles.heading} title={true}>
          1. WHAT INFORMATION DO WE COLLECT?
        </ThemedText>

        <ThemedText style={styles.subheading} title={true}>
          Personal information you disclose to us
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.italic}>
            <ThemedText style={styles.bold}>In Short: </ThemedText>
            We collect personal information that you provide to us.
          </ThemedText>
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          We collect personal information that you voluntarily provide to us
          when you register on the Services, express an interest in obtaining
          information about us or our products and Services, when you
          participate in activities on the Services, or otherwise when you
          contact us.
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.bold}>
            Personal Information Provided by You.{' '}
          </ThemedText>
          The personal information that we collect depends on the context of
          your interactions with us and the Services, the choices you make, and
          the products and features you use. The personal information we collect
          may include the following:
        </ThemedText>

        <View style={styles.listContainer}>
          <ThemedText style={styles.listItem}>• email addresses</ThemedText>
          <ThemedText style={styles.listItem}>• usernames</ThemedText>
          <ThemedText style={styles.listItem}>• passwords</ThemedText>
        </View>

        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.bold}>Sensitive Information. </ThemedText>
          We do not process sensitive information.
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          All personal information that you provide to us must be true,
          complete, and accurate, and you must notify us of any changes to such
          personal information.
        </ThemedText>

        <ThemedText style={styles.subheading} title={true}>
          Google API
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          Our use of information received from Google APIs will adhere to Google
          API Services User Data Policy, including the Limited Use requirements.
        </ThemedText>

        <Spacer height={10} />

        <ThemedText style={styles.heading} title={true}>
          2. HOW DO WE PROCESS YOUR INFORMATION?
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.italic}>
            <ThemedText style={styles.bold}>In Short: </ThemedText>
            We process your information to provide, improve, and administer our
            Services, communicate with you, for security and fraud prevention,
            and to comply with law. We process the personal information for the
            following purposes listed below. We may also process your
            information for other purposes only with your prior explicit
            consent.
          </ThemedText>
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.bold}>
            We process your personal information for a variety of reasons,
            depending on how you interact with our Services, including:
          </ThemedText>
        </ThemedText>

        <View style={styles.listContainer}>
          <ThemedText style={styles.listItem}>
            •{' '}
            <ThemedText style={styles.bold}>
              To facilitate account creation and authentication and otherwise
              manage user accounts.{' '}
            </ThemedText>
            We may process your information so you can create and log in to your
            account, as well as keep your account in working order.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            •{' '}
            <ThemedText style={styles.bold}>
              To save or protect an individual's vital interest.{' '}
            </ThemedText>
            We may process your information when necessary to save or protect an
            individual's vital interest, such as to prevent harm.
          </ThemedText>
        </View>
        <Spacer height={10} />

        <ThemedText style={styles.heading} title={true}>
          3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.italic}>
            <ThemedText style={styles.bold}>In Short: </ThemedText>
            We only process your personal information when we believe it is
            necessary and we have a valid legal reason (i.e. legal basis) to do
            so under applicable law, like with your consent, to comply with
            laws, to provide you with services to enter into or fulfil our
            contractual obligations, to protect your rights, or to fulfil our
            legitimate business interests.
          </ThemedText>
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.bold}>
            If you are located in the EU or UK, this section applies to you.
          </ThemedText>
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.bold}>
            The General Data Protection Regulation (GDPR) and UK GDPR require us
            to explain the valid legal bases we rely on in order to process your
            personal information. As such, we may rely on the following legal
            bases to process your personal information:
          </ThemedText>
        </ThemedText>

        <View style={styles.listContainer}>
          <ThemedText style={styles.listItem}>
            • <ThemedText style={styles.bold}>Consent. </ThemedText>
            We may process your information if you have given us permission
            (i.e. consent) to use your personal information for a specific
            purpose. You can withdraw your consent at any time. Learn more about
            withdrawing your consent.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • <ThemedText style={styles.bold}>Legal Obligations. </ThemedText>
            We may process your information where we believe it is necessary for
            compliance with our legal obligations, such as to cooperate with a
            law enforcement body or regulatory agency, exercise or defend our
            legal rights, or disclose your information as evidence in litigation
            in which we are involved.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • <ThemedText style={styles.bold}>Vital Interests. </ThemedText>
            We may process your information where we believe it is necessary to
            protect your vital interests or the vital interests of a third
            party, such as situations involving potential threats to the safety
            of any person.
          </ThemedText>
        </View>
        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.bold}>
            If you are located in Canada, this section applies to you.
          </ThemedText>
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.bold}>
            We may process your information if you have given us specific
            permission (i.e. express consent) to use your personal information
            for a specific purpose, or in situations where your permission can
            be inferred (i.e. implied consent). You can withdraw your consent at
            any time.
          </ThemedText>
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.bold}>
            In some exceptional cases, we may be legally permitted under
            applicable law to process your information without your consent,
            including, for example:
          </ThemedText>
        </ThemedText>

        <View style={styles.listContainer}>
          <ThemedText style={styles.listItem}>
            • If collection is clearly in the interests of an individual and
            consent cannot be obtained in a timely way
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • For investigations and fraud detection and prevention
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • For business transactions provided certain conditions are met
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • If it is contained in a witness statement and the collection is
            necessary to assess, process, or settle an insurance claim
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • For identifying injured, ill, or deceased persons and
            communicating with next of kin
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • If we have reasonable grounds to believe an individual has been,
            is, or may be victim of financial abuse
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • If it is reasonable to expect collection and use with consent
            would compromise the availability or the accuracy of the information
            and the collection is reasonable for purposes related to
            investigating a breach of an agreement or a contravention of the
            laws of Canada or a province
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • If disclosure is required to comply with a subpoena, warrant,
            court order, or rules of the court relating to the production of
            records
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • If it was produced by an individual in the course of their
            employment, business, or profession and the collection is consistent
            with the purposes for which the information was produced
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • If the collection is solely for journalistic, artistic, or
            literary purposes
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • If the information is publicly available and is specified by the
            regulations
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • We may disclose de-identified information for approved research or
            statistics projects, subject to ethics oversight and confidentiality
            commitments
          </ThemedText>
        </View>

        {/* Additional sections would continue in this pattern */}

        <Spacer height={10} />
        <ThemedText style={styles.heading} title={true}>
          4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.italic}>
            <ThemedText style={styles.bold}>In Short: </ThemedText>
            We may share information in specific situations described in this
            section and/or with the following third parties.
          </ThemedText>
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.bold}>
            We may need to share your personal information in the following
            situations:
          </ThemedText>
        </ThemedText>

        <View style={styles.listContainer}>
          <ThemedText style={styles.listItem}>
            • <ThemedText style={styles.bold}>Business Transfers. </ThemedText>
            We may share or transfer your information in connection with, or
            during negotiations of, any merger, sale of company assets,
            financing, or acquisition of all or a portion of our business to
            another company.
          </ThemedText>
        </View>
        <Spacer height={10} />
        <ThemedText style={styles.heading} title={true}>
          5. HOW LONG DO WE KEEP YOUR INFORMATION?
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.italic}>
            <ThemedText style={styles.bold}>In Short: </ThemedText>
            We keep your information for as long as necessary to fulfil the
            purposes outlined in this Privacy Notice unless otherwise required
            by law.
          </ThemedText>
        </ThemedText>

        <View style={styles.listContainer}>
          <ThemedText style={styles.listItem}>
            We will only keep your personal information for as long as it is
            necessary for the purposes set out in this Privacy Notice, unless a
            longer retention period is required or permitted by law (such as
            tax, accounting, or other legal requirements). No purpose in this
            notice will require us keeping your personal information for longer
            than the period of time in which users have an account with us.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            When we have no ongoing legitimate business need to process your
            personal information, we will either delete or anonymise such
            information, or, if this is not possible (for example, because your
            personal information has been stored in backup archives), then we
            will securely store your personal information and isolate it from
            any further processing until deletion is possible.
          </ThemedText>
        </View>
        <Spacer height={10} />
        <ThemedText style={styles.heading} title={true}>
          6. HOW DO WE KEEP YOUR INFORMATION SAFE?
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.italic}>
            <ThemedText style={styles.bold}>In Short: </ThemedText>
            We aim to protect your personal information through a system of
            organisational and technical security measures.
          </ThemedText>
        </ThemedText>

        <View style={styles.listContainer}>
          <ThemedText style={styles.listItem}>
            We have implemented appropriate and reasonable technical and
            organisational security measures designed to protect the security of
            any personal information we process. However, despite our safeguards
            and efforts to secure your information, no electronic transmission
            over the Internet or information storage technology can be
            guaranteed to be 100% secure, so we cannot promise or guarantee that
            hackers, cybercriminals, or other unauthorised third parties will
            not be able to defeat our security and improperly collect, access,
            steal, or modify your information. Although we will do our best to
            protect your personal information, transmission of personal
            information to and from our Services is at your own risk. You should
            only access the Services within a secure environment.
          </ThemedText>
        </View>
        <Spacer height={10} />
        <ThemedText style={styles.heading} title={true}>
          7. DO WE COLLECT INFORMATION FROM MINORS?
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.italic}>
            <ThemedText style={styles.bold}>In Short: </ThemedText>
            We do not knowingly collect data from or market to children under 18
            years of age or the equivalent age as specified by law in your
            jurisdiction.
          </ThemedText>
        </ThemedText>

        <View style={styles.listContainer}>
          <ThemedText style={styles.listItem}>
            We do not knowingly collect, solicit data from, or market to
            children under 18 years of age or the equivalent age as specified by
            law in your jurisdiction, nor do we knowingly sell such personal
            information. By using the Services, you represent that you are at
            least 18 or the equivalent age as specified by law in your
            jurisdiction or that you are the parent or guardian of such a minor
            and consent to such minor dependent’s use of the Services. If we
            learn that personal information from users less than 18 years of age
            or the equivalent age as specified by law in your jurisdiction has
            been collected, we will deactivate the account and take reasonable
            measures to promptly delete such data from our records. If you
            become aware of any data we may have collected from children under
            age 18 or the equivalent age as specified by law in your
            jurisdiction, please contact us at support@onestepweb.dev.
          </ThemedText>
        </View>
        <Spacer height={10} />
        <ThemedText style={styles.heading} title={true}>
          8. WHAT ARE YOUR PRIVACY RIGHTS?
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.italic}>
            <ThemedText style={styles.bold}>In Short: </ThemedText>
            Depending on your state of residence in the US or in some regions,
            such as the European Economic Area (EEA), United Kingdom (UK),
            Switzerland, and Canada, you have rights that allow you greater
            access to and control over your personal information. You may
            review, change, or terminate your account at any time, depending on
            your country, province, or state of residence.
          </ThemedText>
        </ThemedText>

        <View style={styles.listContainer}>
          <ThemedText style={styles.listItem}>
            In some regions (like the EEA, UK, Switzerland, and Canada), you
            have certain rights under applicable data protection laws. These may
            include the right (i) to request access and obtain a copy of your
            personal information, (ii) to request rectification or erasure;
            (iii) to restrict the processing of your personal information; (iv)
            if applicable, to data portability; and (v) not to be subject to
            automated decision-making. If a decision that produces legal or
            similarly significant effects is made solely by automated means, we
            will inform you, explain the main factors, and offer a simple way to
            request human review. In certain circumstances, you may also have
            the right to object to the processing of your personal information.
            You can make such a request by contacting us by using the contact
            details provided in the section 'HOW CAN YOU CONTACT US ABOUT THIS
            NOTICE?' below.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            We will consider and act upon any request in accordance with
            applicable data protection laws.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            If you are located in the EEA or UK and you believe we are
            unlawfully processing your personal information, you also have the
            right to complain to your Member State data protection authority or
            UK data protection authority.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            If you are located in Switzerland, you may contact the Federal Data
            Protection and Information Commissioner.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            <ThemedText style={styles.bold}>
              Withdrawing your consent:{' '}
            </ThemedText>
            If we are relying on your consent to process your personal
            information, which may be express and/or implied consent depending
            on the applicable law, you have the right to withdraw your consent
            at any time. You can withdraw your consent at any time by contacting
            us by using the contact details provided in the section 'HOW CAN YOU
            CONTACT US ABOUT THIS NOTICE?' below.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            However, please note that this will not affect the lawfulness of the
            processing before its withdrawal nor, when applicable law allows,
            will it affect the processing of your personal information conducted
            in reliance on lawful processing grounds other than consent.
          </ThemedText>
          <ThemedText style={styles.heading} title={true}>
            Account Information
          </ThemedText>
          <ThemedText style={styles.listItem}>
            If you would at any time like to review or change the information in
            your account or terminate your account, you can:
          </ThemedText>
          <ThemedText style={styles.listItem}>
            • Contact us using the contact information provided.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            Upon your request to terminate your account, we will deactivate or
            delete your account and information from our active databases.
            However, we may retain some information in our files to prevent
            fraud, troubleshoot problems, assist with any investigations,
            enforce our legal terms and/or comply with applicable legal
            requirements.
          </ThemedText>
          <ThemedText style={styles.listItem}>
            If you have questions or comments about your privacy rights, you may
            email us at support@onestepweb.dev.
          </ThemedText>
        </View>
        <Spacer height={10} />
        <ThemedText style={styles.heading} title={true}>
          9. CONTROLS FOR DO-NOT-TRACK FEATURES
        </ThemedText>

        <View style={styles.listContainer}>
          <ThemedText style={styles.listItem}>
            Most web browsers and some mobile operating systems and mobile
            applications include a Do-Not-Track ('DNT') feature or setting you
            can activate to signal your privacy preference not to have data
            about your online browsing activities monitored and collected. At
            this stage, no uniform technology standard for recognising and
            implementing DNT signals has been finalised. As such, we do not
            currently respond to DNT browser signals or any other mechanism that
            automatically communicates your choice not to be tracked online. If
            a standard for online tracking is adopted that we must follow in the
            future, we will inform you about that practice in a revised version
            of this Privacy Notice.
          </ThemedText>

          <ThemedText style={styles.listItem}>
            California law requires us to let you know how we respond to web
            browser DNT signals. Because there currently is not an industry or
            legal standard for recognising or honouring DNT signals, we do not
            respond to them at this time.
          </ThemedText>
        </View>
        <Spacer height={10} />
        <ThemedText style={styles.heading} title={true}>
          10. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.italic}>
            <ThemedText style={styles.bold}>In Short: </ThemedText>
            If you are a resident of California, Colorado, Connecticut,
            Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota,
            Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island,
            Tennessee, Texas, Utah, or Virginia, you may have the right to
            request access to and receive details about the personal information
            we maintain about you and how we have processed it, correct
            inaccuracies, get a copy of, or delete your personal information.
            You may also have the right to withdraw your consent to our
            processing of your personal information. These rights may be limited
            in some circumstances by applicable law. More information is
            provided below.
          </ThemedText>
        </ThemedText>
        <ThemedText style={styles.heading} title={true}>
          Categories of Personal Information We Collect
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          The table below shows the categories of personal information we have
          collected in the past twelve (12) months. The table includes
          illustrative examples of each category and does not reflect the
          personal information we collect from you. For a comprehensive
          inventory of all personal information we process, please refer to the
          section 'WHAT INFORMATION DO WE COLLECT?'
        </ThemedText>

        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View
              style={[
                styles.tableCell,
                styles.tableHeader,
                styles.categoryColumn,
              ]}
            >
              <ThemedText style={styles.tableHeaderText}>Category</ThemedText>
            </View>
            <View
              style={[
                styles.tableCell,
                styles.tableHeader,
                styles.examplesColumn,
              ]}
            >
              <ThemedText style={styles.tableHeaderText}>Examples</ThemedText>
            </View>
          </View>

          {/* Table Rows */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.categoryColumn]}>
              <ThemedText style={styles.tableCellText}>Identifiers</ThemedText>
            </View>
            <View style={[styles.tableCell, styles.examplesColumn]}>
              <ThemedText style={styles.tableCellText}>
                Email address, username
              </ThemedText>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.categoryColumn]}>
              <ThemedText style={styles.tableCellText}>
                Authentication data
              </ThemedText>
            </View>
            <View style={[styles.tableCell, styles.examplesColumn]}>
              <ThemedText style={styles.tableCellText}>
                Password, security questions
              </ThemedText>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.categoryColumn]}>
              <ThemedText style={styles.tableCellText}>Usage data</ThemedText>
            </View>
            <View style={[styles.tableCell, styles.examplesColumn]}>
              <ThemedText style={styles.tableCellText}>
                Reading history, book collections, search queries
              </ThemedText>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.categoryColumn]}>
              <ThemedText style={styles.tableCellText}>
                Device information
              </ThemedText>
            </View>
            <View style={[styles.tableCell, styles.examplesColumn]}>
              <ThemedText style={styles.tableCellText}>
                Device type, operating system
              </ThemedText>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.categoryColumn]}>
              <ThemedText style={styles.tableCellText}>
                Financial information
              </ThemedText>
            </View>
            <View style={[styles.tableCell, styles.examplesColumn]}>
              <ThemedText style={styles.tableCellText}>
                Not collected
              </ThemedText>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.categoryColumn]}>
              <ThemedText style={styles.tableCellText}>
                Location data
              </ThemedText>
            </View>
            <View style={[styles.tableCell, styles.examplesColumn]}>
              <ThemedText style={styles.tableCellText}>
                Not collected
              </ThemedText>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.categoryColumn]}>
              <ThemedText style={styles.tableCellText}>
                Biometric information
              </ThemedText>
            </View>
            <View style={[styles.tableCell, styles.examplesColumn]}>
              <ThemedText style={styles.tableCellText}>
                Not collected
              </ThemedText>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.categoryColumn]}>
              <ThemedText style={styles.tableCellText}>
                Personal Information
              </ThemedText>
            </View>
            <View style={[styles.tableCell, styles.examplesColumn]}>
              <ThemedText style={styles.tableCellText}>
                Not collected
              </ThemedText>
            </View>
          </View>
        </View>
        <ThemedText style={styles.listItem}>
          We may also collect other personal information outside of these
          categories through instances where you interact with us in person,
          online, or by phone or mail in the context of:
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Receiving help through our customer support channels;
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Participation in customer surveys or contests; and
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Facilitation in the delivery of our Services and to respond to your
          inquiries.
        </ThemedText>
        <ThemedText style={styles.listItem}>
          We will use and retain the collected personal information as needed to
          provide the Services or for:
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Category H - The app does not collect sensory data.
        </ThemedText>
        <ThemedText style={styles.heading} title={true}>
          Sources of Personal Information
        </ThemedText>
        <ThemedText style={styles.listItem}>
          Learn more about the sources of personal information we collect in
          'WHAT INFORMATION DO WE COLLECT?'
        </ThemedText>
        <ThemedText style={styles.heading} title={true}>
          How We Use and Share Personal Information
        </ThemedText>
        <ThemedText style={styles.listItem}>
          Learn more about how we use your personal information in the section,
          'HOW DO WE PROCESS YOUR INFORMATION?'
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.bold}>
            Will your information be shared with anyone else?
          </ThemedText>
        </ThemedText>
        <ThemedText style={styles.listItem}>
          We may disclose your personal information with our service providers
          pursuant to a written contract between us and each service provider.
          Learn more about how we disclose personal information to in the
          section, 'WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?'
        </ThemedText>
        <ThemedText style={styles.listItem}>
          We may use your personal information for our own business purposes,
          such as for undertaking internal research for technological
          development and demonstration. This is not considered to be 'selling'
          of your personal information.
        </ThemedText>
        <ThemedText style={styles.listItem}>
          We have not disclosed, sold, or shared any personal information to
          third parties for a business or commercial purpose in the preceding
          twelve (12) months. We will not sell or share personal information in
          the future belonging to website visitors, users, and other consumers.
        </ThemedText>
        <ThemedText style={styles.heading} title={true}>
          Your Rights
        </ThemedText>
        <ThemedText style={styles.listItem}>
          You have rights under certain US state data protection laws. However,
          these rights are not absolute, and in certain cases, we may decline
          your request as permitted by law. These rights include:
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Right to know whether or not we are processing your personal data
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Right to access your personal data
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Right to correct inaccuracies in your personal data
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Right to request the deletion of your personal data
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Right to obtain a copy of the personal data you previously shared
          with us
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Right to non-discrimination for exercising your rights
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Right to opt out of the processing of your personal data if it is
          used for targeted advertising (or sharing as defined under
          California’s privacy law), the sale of personal data, or profiling in
          furtherance of decisions that produce legal or similarly significant
          effects ('profiling')
        </ThemedText>
        <ThemedText style={styles.listItem}>
          Depending upon the state where you live, you may also have the
          following rights:
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Right to access the categories of personal data being processed (as
          permitted by applicable law, including the privacy law in Minnesota)
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Right to obtain a list of the categories of third parties to which
          we have disclosed personal data (as permitted by applicable law,
          including the privacy law in California, Delaware, and Maryland)
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Right to obtain a list of specific third parties to which we have
          disclosed personal data (as permitted by applicable law, including the
          privacy law in Minnesota and Oregon)
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Right to review, understand, question, and correct how personal data
          has been profiled (as permitted by applicable law, including the
          privacy law in Minnesota)
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Right to limit use and disclosure of sensitive personal data (as
          permitted by applicable law, including the privacy law in California)
        </ThemedText>
        <ThemedText style={styles.listItem}>
          • Right to opt out of the collection of sensitive data and personal
          data collected through the operation of a voice or facial recognition
          feature (as permitted by applicable law, including the privacy law in
          Florida)
        </ThemedText>
        <ThemedText style={styles.heading} title={true}>
          How to Exercise Your Rights
        </ThemedText>
        <ThemedText style={styles.listItem}>
          To exercise these rights, you can contact us by submitting a data
          subject access request, by emailing us at support@onestepweb.dev, or
          by referring to the contact details at the bottom of this document.
        </ThemedText>
        <ThemedText style={styles.listItem}>
          Under certain US state data protection laws, you can designate an
          authorised agent to make a request on your behalf. We may deny a
          request from an authorised agent that does not submit proof that they
          have been validly authorised to act on your behalf in accordance with
          applicable laws.
        </ThemedText>
        <ThemedText style={styles.heading} title={true}>
          Request Verification
        </ThemedText>
        <ThemedText style={styles.listItem}>
          Upon receiving your request, we will need to verify your identity to
          determine you are the same person about whom we have the information
          in our system. We will only use personal information provided in your
          request to verify your identity or authority to make the request.
          However, if we cannot verify your identity from the information
          already maintained by us, we may request that you provide additional
          information for the purposes of verifying your identity and for
          security or fraud-prevention purposes.
        </ThemedText>
        <ThemedText style={styles.listItem}>
          If you submit the request through an authorised agent, we may need to
          collect additional information to verify your identity before
          processing your request and the agent will need to provide a written
          and signed permission from you to submit such request on your behalf.
        </ThemedText>
        <Spacer height={10} />

        <ThemedText style={styles.heading} title={true}>
          Appeals
        </ThemedText>
        <ThemedText style={styles.listItem}>
          Under certain US state data protection laws, if we decline to take
          action regarding your request, you may appeal our decision by emailing
          us at support@onestepweb.dev. We will inform you in writing of any
          action taken or not taken in response to the appeal, including a
          written explanation of the reasons for the decisions. If your appeal
          is denied, you may submit a complaint to your state attorney general.
        </ThemedText>
        <ThemedText style={styles.heading} title={true}>
          California 'Shine The Light' Law
        </ThemedText>
        <ThemedText style={styles.listItem}>
          California Civil Code Section 1798.83, also known as the 'Shine The
          Light' law, permits our users who are California residents to request
          and obtain from us, once a year and free of charge, information about
          categories of personal information (if any) we disclosed to third
          parties for direct marketing purposes and the names and addresses of
          all third parties with which we shared personal information in the
          immediately preceding calendar year. If you are a California resident
          and would like to make such a request, please submit your request in
          writing to us by using the contact details provided in the section
          'HOW CAN YOU CONTACT US ABOUT THIS NOTICE?'
        </ThemedText>
        <ThemedText style={styles.heading} title={true}>
          11. DO WE MAKE UPDATES TO THIS NOTICE?
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          <ThemedText style={styles.italic}>
            <ThemedText style={styles.bold}>In Short: </ThemedText>
            Yes, we will update this notice as necessary to stay compliant with
            relevant laws.
          </ThemedText>
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          We may update this Privacy Notice from time to time. The updated
          version will be indicated by an updated 'Revised' date at the top of
          this Privacy Notice. If we make material changes to this Privacy
          Notice, we may notify you either by prominently posting a notice of
          such changes or by directly sending you a notification. We encourage
          you to review this Privacy Notice frequently to be informed of how we
          are protecting your information.
        </ThemedText>

        <Spacer height={10} />

        <ThemedText style={styles.heading} title={true}>
          12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          If you have questions or comments about this notice, you may email us
          at peter@onestepweb.dev or contact us by post at:
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          OneStepWeb{'\n'}
          Hornbostelgasse 5{'\n'}
          Wien 1060{'\n'}
          Austria
        </ThemedText>

        <Spacer height={10} />

        <ThemedText style={styles.heading} title={true}>
          13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM
          YOU?
        </ThemedText>

        <ThemedText style={styles.paragraph}>
          Based on the applicable laws of your country or state of residence in
          the US, you may have the right to request access to the personal
          information we collect from you, details about how we have processed
          it, correct inaccuracies, or delete your personal information. You may
          also have the right to withdraw your consent to our processing of your
          personal information. These rights may be limited in some
          circumstances by applicable law. To request to review, update, or
          delete your personal information, please fill out and submit a data
          subject access request.
        </ThemedText>

        <Spacer height={20} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#595959',
    marginBottom: 10,
  },
  heading: {
    fontSize: 19,
    marginVertical: 15,
    color: '#000000',
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 17,
    marginVertical: 10,
    color: '#000000',
  },
  paragraph: {
    marginBottom: 15,
    lineHeight: 22,
    color: '#595959',
    fontSize: 14,
  },
  listContainer: {
    marginBottom: 15,
    paddingLeft: 5,
  },
  listItem: {
    marginBottom: 10,
    lineHeight: 20,
    color: '#595959',
    fontSize: 14,
    paddingLeft: 10,
  },
  bold: {
    fontWeight: 'bold',
    color: '#595959',
  },
  italic: {
    fontStyle: 'italic',
    color: '#595959',
  },
  tableContainer: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableCell: {
    flex: 1,
    padding: 10,
  },
  tableHeader: {
    backgroundColor: '#f7f7f7',
  },
  categoryColumn: {
    flex: 2,
  },
  examplesColumn: {
    flex: 3,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: '#333',
  },
  tableCellText: {
    color: '#595959',
  },
});
