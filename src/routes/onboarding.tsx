import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LocateFixed, MapPin } from "@/components/PixelIcons";
import { writeLocal, ONBOARDING_KEY, PROFILE_KEY, EMPTY_PROFILE, type MyProfile, type Onboarding } from "@/lib/store";
import { ProfileForm } from "@/components/ProfileForm";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Join the collective — NAMED" },
      { name: "description", content: "Set up your NAMED Collective profile in five quick steps." },
      { property: "og:title", content: "Join the collective — NAMED" },
      { property: "og:description", content: "Set up your NAMED Collective profile in five quick steps." },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [location, setLocation] = useState("");
  const [intent, setIntent] = useState<Onboarding["intent"]>("");

  const next = () => setStep((s) => s + 1);
  const finish = (profile?: MyProfile) => {
    if (profile && !writeLocal(PROFILE_KEY, profile)) {
      toast("That's a lot of work! Remove a video or two and try again.");
      return;
    }
    writeLocal<Onboarding>(ONBOARDING_KEY, {
      name: name.trim(),
      email,
      location: location.trim() || "London",
      intent,
      done: true,
    });
    navigate({ to: "/intro" });
  };

  return (
    <div className="flex flex-1 flex-col px-4 pb-8 pt-6">
      <div className="grid grid-cols-5 gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step + 1} aria-label={`Step ${step + 1} of 5`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-0.5 ${i <= step ? "bg-foreground" : "bg-muted"}`} />
        ))}
      </div>
      <div className="mx-auto mt-8 flex h-12 items-center justify-center rounded-md border border-foreground px-3 text-sm font-bold tracking-[0.3em]">
        NAMED
      </div>

      {step === 0 && (
        <form className="flex flex-1 flex-col" onSubmit={(e) => { e.preventDefault(); if (name.trim()) next(); }}>
          <Heading title="What's your name?" sub="This is how you'll show up on the map." />
          <label className="sr-only" htmlFor="name">Your name</label>
          <input id="name" className="field" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
          <button className="btn btn-primary mt-3 w-full" disabled={!name.trim()}>Next</button>
          <p className="mt-auto pt-10 text-center text-sm">
            Already have an account?{" "}
            <button type="button" className="link-u min-h-11 font-semibold" onClick={() => toast("Demo only — no accounts here yet, bestie.")}>
              Log in
            </button>
          </p>
        </form>
      )}

      {step === 1 && (
        <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); if (terms) next(); }}>
          <Heading title="Create your account" sub="Choose an email and password." />
          <label className="sr-only" htmlFor="email">Email address</label>
          <input id="email" type="email" className="field" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <label className="sr-only" htmlFor="password">Password</label>
          <input id="password" type="password" className="field mt-3" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          <div className="mt-3 flex min-h-11 items-center gap-3 text-sm">
            <input id="terms" type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="size-5 accent-foreground" />
            <label htmlFor="terms">
              I accept the{" "}
              <button type="button" className="link-u" onClick={() => setShowTerms((v) => !v)} aria-expanded={showTerms}>
                Terms &amp; Conditions
              </button>
            </label>
          </div>
          {showTerms && (
            <div className="mt-2 rounded-md border border-line p-3 text-xs leading-relaxed">
              <p>· You must be <strong>18+</strong> to join the collective.</p>
              <p>· Your location is shown at <strong>neighbourhood level only</strong> — never your exact address.</p>
              <p>· Contact happens off-app on Instagram. Be kind.</p>
            </div>
          )}
          <button className="btn btn-primary mt-3 w-full" disabled={!terms}>Next</button>
        </form>
      )}

      {step === 2 && (
        <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); next(); }}>
          <Heading title="Where are you based?" sub="We'll show you creatives near you first." />
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <label className="sr-only" htmlFor="loc">City or postcode</label>
            <input id="loc" className="field pl-10" placeholder="City or postcode" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <button type="button" className="link-u mx-auto mt-2 flex min-h-11 items-center gap-1.5 text-sm" onClick={() => { setLocation("London"); toast("Found you: London (neighbourhood level only)"); }}>
            <LocateFixed className="size-4" /> Use my current location
          </button>
          <button className="btn btn-primary mt-2 w-full" disabled={!location.trim()}>Next</button>
        </form>
      )}

      {step === 3 && (
        <div className="flex flex-1 flex-col">
          <Heading title="Are you here to discover or be discovered?" />
          <Choice active={intent === "discover"} onClick={() => setIntent("discover")}>Discover</Choice>
          <p className="my-3 text-center text-sm text-muted-foreground">or</p>
          <Choice active={intent === "discovered"} onClick={() => setIntent("discovered")}>Be discovered</Choice>
          <p className="mt-4 text-center text-xs text-muted-foreground">This will not affect your ability to do either.</p>
          <button className="btn btn-primary mt-auto w-full" disabled={!intent} onClick={next}>Next</button>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col">
          <Heading title="Build your collective" sub="Show us what you make. You can change all of this later." />
          <ProfileForm
            initial={{ ...EMPTY_PROFILE, neighbourhood: location.trim() && location.trim().toLowerCase() !== "london" ? location.trim() : "" }}
            submitLabel="Let's go"
            onSave={(p) => finish(p)}
          >
            <button type="button" className="btn btn-secondary w-full" onClick={() => finish()}>
              Skip for now
            </button>
          </ProfileForm>
        </div>
      )}
    </div>
  );
}

function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8 mt-12 text-center">
      <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
      {sub && <p className="mt-2 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button aria-pressed={active} onClick={onClick} className={`btn min-h-14 w-full rounded-full ${active ? "btn-primary" : "btn-secondary"}`}>
      {children}
    </button>
  );
}
