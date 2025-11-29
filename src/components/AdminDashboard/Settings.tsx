// src/components/Settings.tsx
import React, { useEffect, useState } from "react";
import {
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Users,
  BookOpen,
  Tag,
  Award,
  ShoppingCart,
  Zap,
  Shield,
  Download,
  Upload,
  Mail,
  Bell,
  Image,
  Phone,
  Cpu,
  Check,
  X,
  PaintBucket,
  Smartphone,
  FileText,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Single-file Settings component with multiple tabs.
 * - Uses localStorage for persistence (simple demo)
 * - Contains internal AddUserType drawer component
 * - TypeScript + Tailwind classes
 *
 * Drop-in ready.
 */

/* ----------------------------- Types ----------------------------- */
type TabId =
  | "portal"
  | "users"
  | "user-types"
  | "courses"
  | "categories"
  | "skills"
  | "gamification"
  | "integrations"
  | "security"
  | "import-export"
  | "email"
  | "notifications"
  | "themes"
  | "mobile-app"
  | "certificates";

/* --------------------------- Utility ----------------------------- */
const saveToLS = (key: string, data: any) =>
  localStorage.setItem(key, JSON.stringify(data));
const loadFromLS = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

/* ---------------------- AddUserType Drawer ----------------------- */
type NewUserType = { name: string; roles: string[] };

const AddUserTypeDrawer: React.FC<{
  open: boolean;
  onSave: (nt: NewUserType) => void;
  onCancel: () => void;
}> = ({ open, onSave, onCancel }) => {
  const [name, setName] = useState("");
  const [roles, setRoles] = useState<string[]>(["Learner"]);

  useEffect(() => {
    if (open) {
      setName("");
      setRoles(["Learner"]);
    }
  }, [open]);

  const toggleRole = (r: string) =>
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 p-6 overflow-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Create User Type</h3>
              <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Name</label>
              <input
                className="w-full px-3 py-2 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Trainer"
              />

              <div>
                <label className="text-sm font-medium block mb-2">Roles</label>
                <div className="flex gap-2 flex-wrap">
                  {["Administrator", "Instructor", "Learner"].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => toggleRole(r)}
                      className={`px-3 py-1 rounded-full border ${
                        roles.includes(r)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button onClick={onCancel} className="px-4 py-2 rounded border">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!name.trim()) return alert("Please enter a name");
                    onSave({ name: name.trim(), roles });
                  }}
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* --------------------------- Main Component --------------------------- */
export default function Settings(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>("user-types");

  /* --------------------- Portal state --------------------- */
  const [siteName, setSiteName] = useState<string>(() =>
    loadFromLS("portal.siteName", "bat")
  );
  const [siteDescription, setSiteDescription] = useState<string>(() =>
    loadFromLS(
      "portal.siteDescription",
      "TalentLMS - Cloud based, Lean Learning Platform with an Emphasis on Usability and Easy Course Creation"
    )
  );
  const [domainName, setDomainName] = useState<string>(() =>
    loadFromLS("portal.domainName", "bat.talentlms.com")
  );
  const [editingDomain, setEditingDomain] = useState(false);

  /* -------------------- Integrations state -------------------- */
  const [integrations, setIntegrations] = useState<Record<string, boolean>>(() =>
    loadFromLS("integrations.status", {
      Zoom: false,
      Salesforce: true,
      Slack: false,
      "Google SSO": false,
      "Microsoft Teams": false,
      Zapier: false,
    })
  );

  /* ---------------------- Security state ---------------------- */
  const [require2FAForAdmins, setRequire2FAForAdmins] = useState<boolean>(() =>
    loadFromLS("security.2fa", true)
  );
  const [passwordPolicy, setPasswordPolicy] = useState<string>(() =>
    loadFromLS("security.passwordPolicy", "Strong (8+ chars, mixed case, numbers, symbols)")
  );
  const [sessionTimeout, setSessionTimeout] = useState<string>(() =>
    loadFromLS("security.sessionTimeout", "60")
  );
  const [ipRestrictions, setIpRestrictions] = useState<string>(() =>
    loadFromLS("security.ipRestrictions", "")
  );

  /* -------------------- Gamification state -------------------- */
  const [enablePoints, setEnablePoints] = useState<boolean>(() =>
    loadFromLS("gamification.points", true)
  );
  const [enableBadges, setEnableBadges] = useState<boolean>(() =>
    loadFromLS("gamification.badges", true)
  );
  const [showLeaderboards, setShowLeaderboards] = useState<boolean>(() =>
    loadFromLS("gamification.leaderboards", false)
  );

  /* --------------------- User Types state --------------------- */
  type RoleTable = {
    id: string;
    name: string;
    administrator: boolean;
    instructor: boolean;
    learner: boolean;
  };

  const DEFAULT_ROLES: RoleTable[] = [
    { id: "1", name: "Super-Admin", administrator: true, instructor: true, learner: true },
    { id: "2", name: "Admin-Type", administrator: true, instructor: true, learner: true },
    { id: "3", name: "Trainer-Type", administrator: false, instructor: true, learner: true },
    { id: "4", name: "Learner-Type", administrator: false, instructor: false, learner: true },
  ];

  const [roles, setRoles] = useState<RoleTable[]>(() =>
    loadFromLS("userTypes.roles", DEFAULT_ROLES)
  );
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [isUserTypeDrawerOpen, setIsUserTypeDrawerOpen] = useState(false);

  /* -------------------- Email settings -------------------- */
  const [smtpHost, setSmtpHost] = useState<string>(() => loadFromLS("email.smtpHost", ""));
  const [smtpPort, setSmtpPort] = useState<number>(() => loadFromLS("email.smtpPort", 587));
  const [smtpUser, setSmtpUser] = useState<string>(() => loadFromLS("email.smtpUser", ""));
  const [emailTemplates, setEmailTemplates] = useState<Record<string, string>>(() =>
    loadFromLS("email.templates", {
      "welcome": "Welcome, {{name}}! Your account has been created.",
      "password-reset": "Click the link to reset your password: {{link}}",
    })
  );

  /* ---------------- Notifications ------------------ */
  const [notifLoginAlerts, setNotifLoginAlerts] = useState<boolean>(() =>
    loadFromLS("notifications.loginAlerts", true)
  );
  const [notifReminders, setNotifReminders] = useState<boolean>(() =>
    loadFromLS("notifications.reminders", true)
  );

  /* ---------------- Themes ------------------- */
  const [primaryColor, setPrimaryColor] = useState<string>(() =>
    loadFromLS("themes.primaryColor", "#2563eb")
  );
  const [darkMode, setDarkMode] = useState<boolean>(() =>
    loadFromLS("themes.darkMode", false)
  );

  /* ---------------- Mobile App ---------------- */
  const [mobileEnabled, setMobileEnabled] = useState<boolean>(() =>
    loadFromLS("mobile.enabled", false)
  );
  const [mobileStoreLink, setMobileStoreLink] = useState<string>(() =>
    loadFromLS("mobile.storeLink", "")
  );

  /* ---------------- Certificates ---------------- */
 
  const [certEnabled, setCertEnabled] = useState(true);
const [certTemplate, setCertTemplate] = useState("This certificate is awarded for completing the course.");
const [sampleName] = useState("John Doe");
const [sampleCourse] = useState("Advanced React Development");


  /* ---------------------- Effects: persist ---------------------- */
  useEffect(() => saveToLS("portal.siteName", siteName), [siteName]);
  useEffect(() => saveToLS("portal.siteDescription", siteDescription), [siteDescription]);
  useEffect(() => saveToLS("portal.domainName", domainName), [domainName]);

  useEffect(() => saveToLS("integrations.status", integrations), [integrations]);

  useEffect(() => saveToLS("security.2fa", require2FAForAdmins), [require2FAForAdmins]);
  useEffect(() => saveToLS("security.passwordPolicy", passwordPolicy), [passwordPolicy]);
  useEffect(() => saveToLS("security.sessionTimeout", sessionTimeout), [sessionTimeout]);
  useEffect(() => saveToLS("security.ipRestrictions", ipRestrictions), [ipRestrictions]);

  useEffect(() => saveToLS("gamification.points", enablePoints), [enablePoints]);
  useEffect(() => saveToLS("gamification.badges", enableBadges), [enableBadges]);
  useEffect(() => saveToLS("gamification.leaderboards", showLeaderboards), [showLeaderboards]);

  useEffect(() => saveToLS("userTypes.roles", roles), [roles]);

  useEffect(() => saveToLS("email.smtpHost", smtpHost), [smtpHost]);
  useEffect(() => saveToLS("email.smtpPort", smtpPort), [smtpPort]);
  useEffect(() => saveToLS("email.smtpUser", smtpUser), [smtpUser]);
  useEffect(() => saveToLS("email.templates", emailTemplates), [emailTemplates]);

  useEffect(() => saveToLS("notifications.loginAlerts", notifLoginAlerts), [notifLoginAlerts]);
  useEffect(() => saveToLS("notifications.reminders", notifReminders), [notifReminders]);

  useEffect(() => saveToLS("themes.primaryColor", primaryColor), [primaryColor]);
  useEffect(() => saveToLS("themes.darkMode", darkMode), [darkMode]);

  useEffect(() => saveToLS("mobile.enabled", mobileEnabled), [mobileEnabled]);
  useEffect(() => saveToLS("mobile.storeLink", mobileStoreLink), [mobileStoreLink]);

  useEffect(() => saveToLS("cert.enabled", certEnabled), [certEnabled]);
  useEffect(() => saveToLS("cert.template", certTemplate), [certTemplate]);

  /* -------------------- Handlers -------------------- */
  const handleAddUserType = (nt: NewUserType) => {
    const id = Date.now().toString();
    const newRole: RoleTable = {
      id,
      name: nt.name,
      administrator: nt.roles.includes("Administrator"),
      instructor: nt.roles.includes("Instructor"),
      learner: nt.roles.includes("Learner"),
    };
    setRoles((prev) => [...prev, newRole]);
    // saved via effect
  };

  const handleDeleteRole = (id: string) => {
    if (!confirm("Delete this user type?")) return;
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  /* ---------------------- Render helpers ---------------------- */
  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "portal", label: "Portal", icon: ChevronRight },
    { id: "users", label: "Users", icon: Users },
    { id: "user-types", label: "User types", icon: Tag },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "skills", label: "Skills", icon: Award },
    { id: "gamification", label: "Gamification", icon: Award },
    { id: "integrations", label: "Integrations", icon: Zap },
    { id: "security", label: "Security", icon: Shield },
    { id: "import-export", label: "Import-Export", icon: Download },
    { id: "email", label: "Email", icon: Mail },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "themes", label: "Themes", icon: PaintBucket },
    { id: "mobile-app", label: "Mobile App", icon: Smartphone },
    { id: "certificates", label: "Certificates", icon: FileText },
  ];

  /* ---------------------- Content Renderers ---------------------- */

  const renderPortalContent = () => (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">IDENTITY</h2>

      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Site name</label>
            <p className="text-sm text-gray-600 mb-3">
              This will appear in search engine results as the title of your site.
            </p>
          </div>
          <div>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Site description</label>
            <p className="text-sm text-gray-600 mb-3">
              Briefly describe what your website is about. This will appear in search engine results as the description of your site.
            </p>
          </div>
          <div>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Domain name</label>
            <p className="text-sm text-gray-600 mb-3">If necessary, you can change your TalentLMS domain name anytime you want.</p>
          </div>
          <div>
            <div
              className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setEditingDomain(true)}
            >
              <span className="text-sm text-gray-900">{domainName}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              saveToLS("portal.siteName", siteName);
              saveToLS("portal.siteDescription", siteDescription);
              saveToLS("portal.domainName", domainName);
              alert("Portal settings saved");
            }}
            className="px-5 py-2 rounded bg-blue-600 text-white"
          >
            Save Portal
          </button>
        </div>
      </div>

      <AnimatePresence>
        {editingDomain && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingDomain(false)}
            />
            <motion.div
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-lg w-11/12 max-w-md p-5"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Edit Domain</h3>
                <button onClick={() => setEditingDomain(false)} className="p-1 rounded hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-4"
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setEditingDomain(false)} className="px-4 py-2 border rounded">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    saveToLS("portal.domainName", domainName);
                    setEditingDomain(false);
                    alert("Domain updated");
                  }}
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  const renderUsersContent = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">USER MANAGEMENT</h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Default user type</label>
            <p className="text-sm text-gray-600 mb-3">Select the default user type for new registrations.</p>
          </div>
          <div>
            <select className="w-full px-3 py-2 border rounded">
              <option>Learner</option>
              <option>Instructor</option>
              <option>Administrator</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">User registration</label>
            <p className="text-sm text-gray-600 mb-3">Allow users to register themselves on your portal.</p>
          </div>
          <div>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Enable self-registration</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserTypesContent = () => (
    <div className="relative p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-medium text-gray-900">USER TYPES</h2>
        <button onClick={() => setIsUserTypeDrawerOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded">
          <Plus className="w-4 h-4 mr-2" />
          Create User Type
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Administrator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.id} onMouseEnter={() => setHoveredRole(role.id)} onMouseLeave={() => setHoveredRole(null)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.administrator ? <Check className="w-4 h-4 text-green-600 inline-block" /> : "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.instructor ? <Check className="w-4 h-4 text-green-600 inline-block" /> : "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.learner ? <Check className="w-4 h-4 text-green-600 inline-block" /> : "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {hoveredRole === role.id && (
                    <div className="flex items-center gap-2 justify-end">
                      <button className="text-gray-600 hover:text-gray-900 p-1 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteRole(role.id)} className="text-red-600 hover:text-red-900 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddUserTypeDrawer
        open={isUserTypeDrawerOpen}
        onCancel={() => setIsUserTypeDrawerOpen(false)}
        onSave={(nt) => {
          handleAddUserType(nt);
          setIsUserTypeDrawerOpen(false);
        }}
      />
    </div>
  );

  const renderCoursesContent = () => (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-6">COURSE SETTINGS</h2>
      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" defaultChecked />
          <span>Generate certificates automatically</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" />
          <span>Enable course reviews</span>
        </label>
      </div>
    </div>
  );

  const renderCategoriesContent = () => (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-6">COURSE CATEGORIES</h2>
      <div className="bg-white border rounded p-4">
        <p className="text-sm text-gray-600">Manage categories (static demo).</p>
      </div>
    </div>
  );

  const renderSkillsContent = () => (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-6">SKILLS MANAGEMENT</h2>
      <label className="flex items-center gap-3">
        <input type="checkbox" defaultChecked />
        <span>Enable skills tracking</span>
      </label>
    </div>
  );

  const renderGamificationContent = () => (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-6">GAMIFICATION</h2>
      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={enablePoints} onChange={(e) => setEnablePoints(e.target.checked)} />
          <span>Enable points system</span>
        </label>

        <label className="flex items-center gap-3">
          <input type="checkbox" checked={enableBadges} onChange={(e) => setEnableBadges(e.target.checked)} />
          <span>Enable badges</span>
        </label>

        <label className="flex items-center gap-3">
          <input type="checkbox" checked={showLeaderboards} onChange={(e) => setShowLeaderboards(e.target.checked)} />
          <span>Show leaderboards</span>
        </label>

        <div className="flex justify-end">
          <button onClick={() => alert("Gamification settings saved")} className="px-4 py-2 rounded bg-blue-600 text-white">
            Save Gamification
          </button>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsContent = () => (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-6">INTEGRATIONS</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(integrations).map((k) => (
          <div key={k} className="border rounded p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">{k}</h3>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${integrations[k] ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                  {integrations[k] ? "Connected" : "Not connected"}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">Configure {k} integration.</p>
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => setIntegrations((prev) => ({ ...prev, [k]: !prev[k] }))}
                className={`px-3 py-2 rounded ${integrations[k] ? "bg-red-600 text-white" : "bg-blue-600 text-white"}`}
              >
                {integrations[k] ? "Disconnect" : "Connect"}
              </button>
              <button className="px-3 py-2 border rounded">Configure</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecurityContent = () => (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-6">SECURITY SETTINGS</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Two-factor authentication</label>
            <p className="text-sm text-gray-600 mb-2">Require 2FA for administrators.</p>
          </div>
          <div>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={require2FAForAdmins} onChange={(e) => setRequire2FAForAdmins(e.target.checked)} />
              <span>Require 2FA for admins</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Password policy</label>
          </div>
          <div>
            <select value={passwordPolicy} onChange={(e) => setPasswordPolicy(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option>Strong (8+ chars, mixed case, numbers, symbols)</option>
              <option>Medium (8+ chars, mixed case, numbers)</option>
              <option>Basic (6+ chars)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div><label className="block font-medium mb-1">Session timeout (minutes)</label></div>
          <div><select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} className="w-full px-3 py-2 border rounded">
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="240">4 hours</option>
            <option value="0">Never</option>
          </select></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div><label className="block font-medium mb-1">IP restrictions</label><p className="text-sm text-gray-600">Whitelist IPs (one per line)</p></div>
          <div><textarea rows={3} value={ipRestrictions} onChange={(e) => setIpRestrictions(e.target.value)} className="w-full px-3 py-2 border rounded resize-none" /></div>
        </div>

        <div className="flex justify-end">
          <button onClick={() => alert("Security settings saved")} className="px-4 py-2 rounded bg-blue-600 text-white">Save Security</button>
        </div>
      </div>
    </div>
  );

  const renderImportExportContent = () => (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-6">IMPORT & EXPORT</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <div className="flex items-center gap-2 mb-2"><Upload className="w-4 h-4" /><h3 className="font-medium">Import Users</h3></div>
          <p className="text-sm text-gray-600 mb-3">Upload CSV with user data.</p>
          <label className="inline-block">
            <input type="file" accept=".csv" className="hidden" />
            <button className="px-3 py-2 bg-blue-600 text-white rounded">Choose File</button>
          </label>
        </div>

        <div className="border rounded p-4">
          <div className="flex items-center gap-2 mb-2"><Download className="w-4 h-4" /><h3 className="font-medium">Export Users</h3></div>
          <p className="text-sm text-gray-600 mb-3">Download users as CSV.</p>
          <button className="px-3 py-2 bg-green-600 text-white rounded">Download CSV</button>
        </div>
      </div>
    </div>
  );

  const renderEmailContent = () => (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-6">EMAIL SETTINGS</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div><label className="block font-medium mb-1">SMTP Host</label></div>
          <div><input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className="w-full px-3 py-2 border rounded" /></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div><label className="block font-medium mb-1">SMTP Port</label></div>
          <div><input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} className="w-full px-3 py-2 border rounded" /></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div><label className="block font-medium mb-1">SMTP User</label></div>
          <div><input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} className="w-full px-3 py-2 border rounded" /></div>
        </div>

        <div className="pt-4">
          <h3 className="font-medium mb-2">Templates</h3>
          <div className="space-y-3">
            {Object.keys(emailTemplates).map((key) => (
              <div key={key}>
                <label className="text-sm font-medium">{key}</label>
                <textarea rows={3} value={emailTemplates[key]} onChange={(e) => setEmailTemplates((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full px-3 py-2 border rounded resize-none" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={() => alert("Email settings saved")} className="px-4 py-2 rounded bg-blue-600 text-white">Save Email</button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsContent = () => (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-6">NOTIFICATIONS</h2>

      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={notifLoginAlerts} onChange={(e) => setNotifLoginAlerts(e.target.checked)} />
          <span>Login alerts</span>
        </label>

        <label className="flex items-center gap-3">
          <input type="checkbox" checked={notifReminders} onChange={(e) => setNotifReminders(e.target.checked)} />
          <span>Reminders & due dates</span>
        </label>

        <div className="flex justify-end">
          <button onClick={() => alert("Notifications saved")} className="px-4 py-2 rounded bg-blue-600 text-white">Save Notifications</button>
        </div>
      </div>
    </div>
  );

  const renderThemesContent = () => (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-6">THEMES & APPEARANCE</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-2">Primary color</label>
          <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-16 h-10 p-0 border-0" />
        </div>

        <div>
          <label className="block font-medium mb-2">Dark mode</label>
          <label className="flex items-center gap-3"><input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} /> <span>Enable dark mode</span></label>
        </div>
      </div>

      <div className="mt-6 border rounded p-4">
        <h4 className="font-medium mb-2">Preview</h4>
        <div className="p-4 rounded" style={{ background: darkMode ? "#0f172a" : "#ffffff", color: darkMode ? "#fff" : "#111" }}>
          <button style={{ background: primaryColor }} className="px-3 py-1 rounded text-white mr-2">Primary</button>
          <button className="px-3 py-1 rounded border">Secondary</button>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button onClick={() => alert("Theme settings saved")} className="px-4 py-2 rounded bg-blue-600 text-white">Save Theme</button>
      </div>
    </div>
  );

  const renderMobileAppContent = () => (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-6">MOBILE APP</h2>

      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={mobileEnabled} onChange={(e) => setMobileEnabled(e.target.checked)} />
          <span>Enable Mobile App features</span>
        </label>

        <div>
          <label className="block font-medium mb-1">Store Link</label>
          <input value={mobileStoreLink} onChange={(e) => setMobileStoreLink(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="https://play.google.com/..." />
        </div>

        <div className="flex justify-end">
          <button onClick={() => alert("Mobile app settings saved")} className="px-4 py-2 rounded bg-blue-600 text-white">Save Mobile App</button>
        </div>
      </div>
    </div>
  );

  const renderCertificatesContent = () => (
  <div className="p-6">
    <h2 className="text-lg font-medium mb-6">CERTIFICATES</h2>

    <div className="space-y-8">

      {/* Enable Certificates */}
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={certEnabled}
          onChange={(e) => setCertEnabled(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-gray-800">Enable course completion certificates</span>
      </label>

      {/* Template Editor */}
      <div>
        <label className="block font-medium mb-2 text-gray-900">
          Certificate Template
        </label>

        <textarea
          rows={5}
          value={certTemplate}
          onChange={(e) => setCertTemplate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
          focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Write certificate template here…"
        />
      </div>

      {/* --- CERTIFICATE PREVIEW --- */}
      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-3">
          Preview
        </h3>

        <div className="border rounded-md p-6 bg-white shadow-sm">
          <div className="text-center border-2 border-dashed border-gray-300 p-10 rounded-md">

            {/* SAMPLE CERTIFICATE */}
            <h2 className="text-2xl font-bold mb-3 text-gray-900 tracking-wide">
              Certificate of Completion
            </h2>

            <p className="text-gray-700 text-sm mb-4">
              This certifies that
            </p>

            <p className="text-xl font-semibold text-gray-900 mb-4">
              {sampleName}
            </p>

            <p className="text-gray-700 text-sm mb-4">
              has successfully completed the course
            </p>

            <p className="text-lg font-medium text-gray-900 mb-6">
              {sampleCourse}
            </p>

            <p className="text-gray-500 text-xs italic">
              {certTemplate || "Your certificate template content will appear here…"}
            </p>

            <div className="mt-8 flex justify-between px-10">
              <div className="text-center">
                <div className="w-32 h-[1px] bg-gray-400 mx-auto mb-1"></div>
                <p className="text-xs text-gray-600">Instructor Signature</p>
              </div>

              <div className="text-center">
                <div className="w-32 h-[1px] bg-gray-400 mx-auto mb-1"></div>
                <p className="text-xs text-gray-600">Date</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={() => alert("Certificate settings saved")}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          Save Certificates
        </button>
      </div>
    </div>
  </div>
);


  /* ---------------------- Main render ---------------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b px-6 py-4 bg-white">
        <h1 className="text-2xl font-semibold text-gray-900">Account & Settings</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-6">
        {/* Left nav */}
        <aside className="col-span-3">
          <nav className="bg-white border rounded-lg p-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition ${
                    activeTab === tab.id ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="col-span-9">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            {activeTab === "portal" && renderPortalContent()}
            {activeTab === "users" && renderUsersContent()}
            {activeTab === "user-types" && renderUserTypesContent()}
            {activeTab === "courses" && renderCoursesContent()}
            {activeTab === "categories" && renderCategoriesContent()}
            {activeTab === "skills" && renderSkillsContent()}
            {activeTab === "gamification" && renderGamificationContent()}
            {activeTab === "integrations" && renderIntegrationsContent()}
            {activeTab === "security" && renderSecurityContent()}
            {activeTab === "import-export" && renderImportExportContent()}
            {activeTab === "email" && renderEmailContent()}
            {activeTab === "notifications" && renderNotificationsContent()}
            {activeTab === "themes" && renderThemesContent()}
            {activeTab === "mobile-app" && renderMobileAppContent()}
            {activeTab === "certificates" && renderCertificatesContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
