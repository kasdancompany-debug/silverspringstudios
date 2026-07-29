import { ButtonLink } from "@/components/ui/ButtonLink";

/** Indie Rights–style welcome block: plain, personal, direct. */
export function WelcomeSection() {
  return (
    <section id="welcome" className="bg-void py-20 md:py-28">
      <div className="container-page max-w-3xl">
        <h2 className="font-impact text-[clamp(2.5rem,6vw,4rem)] tracking-[0.04em] text-ivory">
          Welcome to Silver Spring Studios
        </h2>
        <div className="mt-8 space-y-5 text-base leading-[1.75] text-silver md:text-lg">
          <p>
            We are an independent film distributor with a personal approach to releasing completed
            films for digital and streaming audiences. Whether you need help getting your film out
            into the world, or you want a partner who cares about how your title is presented
            online, we are here to help.
          </p>
          <p>
            If you have a completed feature-length film, documentary, or limited series, please
            submit your project so we can consider it for distribution.
          </p>
        </div>
        <div className="mt-10">
          <ButtonLink href="/submit" variant="signal" size="lg">
            Submit Now
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
