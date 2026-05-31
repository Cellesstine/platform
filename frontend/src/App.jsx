import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

// Public
import LandingPage from "./pages/public/LandingPage";
import AboutPage from "./pages/public/AboutPage";
import HowItWorksPage from "./pages/public/HowItWorksPage";
import CompanyPublicPage from "./pages/public/CompanyPublicPage";

// Auth
import SignInPage from "./pages/auth/SignInPage";
import RegisterPage from "./pages/auth/RegisterPage";
import OAuthCallbackPage from "./pages/auth/OAuthCallbackPage";
import EmailVerificationPage from "./pages/auth/EmailVerificationPage";
import EmailVerifyCallbackPage from "./pages/auth/EmailVerifyCallbackPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import VerifyCodePage from "./pages/auth/VerifyCodePage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import PasswordResetSuccessPage from "./pages/auth/PasswordResetSuccessPage";
import AccountVerifyEmailRedirect from "./pages/auth/AccountVerifyEmailRedirect";
import AccountPasswordResetRedirect from "./pages/auth/AccountPasswordResetRedirect";
import ReactivateAccountPage from "./pages/auth/ReactivateAccountPage";
import EmailChangeVerifyPage from "./pages/auth/EmailChangeVerifyPage";
import RequestReactivationPage from "./pages/auth/RequestReactivationPage";

import {
  OnboardingAccount,
  OnboardingCompany,
  OnboardingDocuments,
  PendingVerificationPage,
} from "./pages/onboarding/OnboardingPages";

import {
  ProfessionalAccountPage,
  ProfessionalVerifyEmailPage,
  ProfessionalProfileSetupPage,
  ProfessionalDocumentsPage,
  ProfessionalPendingPage,
} from "./pages/professional/onboarding/ProfessionalOnboarding";

// Business dashboard
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import AnnouncementsPage from "./pages/dashboard/AnnouncementsPage";
import NewAnnouncementPage from "./pages/dashboard/NewAnnouncementPage";
import ApplicantsPage from "./pages/dashboard/ApplicantsPage";
import FindWorkersPage from "./pages/dashboard/FindWorkersPage";
import CompanyProfilePage from "./pages/dashboard/CompanyProfilePage";
import CompanyProfileEditPage from "./pages/dashboard/CompanyProfileEditPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

// Professional dashboard
import ProfessionalDashboardLayout from "./components/ProfessionalDashboardLayout";
import ProfessionalDashboardHome from "./pages/professional/dashboard/ProfessionalDashboardHome";
import ProfessionalAnnouncementsPage from "./pages/professional/dashboard/ProfessionalAnnouncementsPage";
import ProfessionalJobDetailPage from "./pages/professional/dashboard/ProfessionalJobDetailPage";
import ProfessionalProfilePage from "./pages/professional/dashboard/ProfessionalProfilePage";
import ProfessionalProfileEditPage from "./pages/professional/dashboard/ProfessionalProfileEditPage";
import ProfessionalSettingsPage from "./pages/professional/dashboard/ProfessionalSettingsPage";
import ProfessionalApplicationsPage from "./pages/professional/dashboard/ProfessionalApplicationsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how" element={<HowItWorksPage />} />
        <Route path="/companies/:id" element={<CompanyPublicPage />} />

        {/* Auth — guests only */}
        <Route
          path="/sign-in"
          element={
            <GuestRoute>
              <SignInPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route
          path="/verify-email/confirm"
          element={
            <EmailVerifyCallbackPage portal="business" nextPath="/onboarding/company" />
          }
        />
        <Route
          path="/verify-email/confirm/:uidb64/:token"
          element={
            <EmailVerifyCallbackPage portal="business" nextPath="/onboarding/company" />
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPasswordPage />
            </GuestRoute>
          }
        />
        <Route path="/verify-code" element={<VerifyCodePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password/:uidb64/:token" element={<ResetPasswordPage />} />
        <Route path="/password-reset-success" element={<PasswordResetSuccessPage />} />
        <Route path="/request-reactivation" element={<RequestReactivationPage />} />

        {/* Backend-shaped email link paths (same as API emails) */}
        <Route path="/account/verify-email/:uidb64/:token" element={<AccountVerifyEmailRedirect />} />
        <Route path="/account/password/reset/:uidb64/:token" element={<AccountPasswordResetRedirect />} />
        <Route path="/account/reactivate/:uidb64/:token" element={<ReactivateAccountPage />} />
        <Route path="/account/email/verify/:uidb64/:token" element={<EmailChangeVerifyPage />} />

        {/* Business onboarding */}
        <Route
          path="/onboarding/account"
          element={
            <GuestRoute>
              <OnboardingAccount />
            </GuestRoute>
          }
        />
        <Route path="/onboarding/company" element={<OnboardingCompany />} />
        <Route path="/onboarding/documents" element={<OnboardingDocuments />} />
        <Route path="/onboarding/pending" element={<PendingVerificationPage />} />

        {/* Professional onboarding */}
        <Route
          path="/professional/onboarding/account"
          element={
            <GuestRoute>
              <ProfessionalAccountPage />
            </GuestRoute>
          }
        />
        <Route path="/professional/onboarding/verify-email" element={<ProfessionalVerifyEmailPage />} />
        <Route
          path="/professional/onboarding/verify-email/confirm"
          element={
            <EmailVerifyCallbackPage
              portal="professional"
              nextPath="/professional/onboarding/profile"
            />
          }
        />
        <Route
          path="/professional/onboarding/verify-email/confirm/:uidb64/:token"
          element={
            <EmailVerifyCallbackPage
              portal="professional"
              nextPath="/professional/onboarding/profile"
            />
          }
        />
        <Route path="/professional/onboarding/profile" element={<ProfessionalProfileSetupPage />} />
        <Route path="/professional/onboarding/documents" element={<ProfessionalDocumentsPage />} />
        <Route path="/professional/onboarding/pending" element={<ProfessionalPendingPage />} />

        {/* Business dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="enterprise">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="announcements/new" element={<NewAnnouncementPage />} />
          <Route path="applicants" element={<ApplicantsPage />} />
          <Route path="find-workers" element={<FindWorkersPage />} />
          <Route path="company-profile" element={<CompanyProfilePage />} />
          <Route path="company-profile/edit" element={<CompanyProfileEditPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Professional dashboard */}
        <Route
          path="/professional/dashboard"
          element={
            <ProtectedRoute role="individual">
              <ProfessionalDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProfessionalDashboardHome />} />
          <Route path="announcements" element={<ProfessionalAnnouncementsPage />} />
          <Route path="announcements/:id" element={<ProfessionalJobDetailPage />} />
          <Route path="applications" element={<ProfessionalApplicationsPage />} />
          <Route path="find-workers" element={<FindWorkersPage />} />
          <Route path="profile" element={<ProfessionalProfilePage />} />
          <Route path="profile/edit" element={<ProfessionalProfileEditPage />} />
          <Route path="settings" element={<ProfessionalSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
