import { useEffect, useState } from "react";

type Repo = { name: string; description: string | null; html_url: string };
type ContribDay = { date: string; count: number; level: number };

const USER = "shivansmh";

export function GithubCard() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [days, setDays] = useState<ContribDay[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=3`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Repo[]) => setRepos(data.slice(0, 3)))
      .catch(() => setRepos([]));

    fetch(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return setDays([]);
        setDays((data.contributions as ContribDay[]).slice(-26 * 7));
        setTotal(data.total?.lastYear ?? null);
      })
      .catch(() => setDays([]));
  }, []);

  return (
    <span className="block w-72 rounded-lg border border-border bg-card/90 p-4 shadow-[0_12px_40px_-12px_var(--color-primary)] backdrop-blur-md">
      <span className="mb-3 block w-fit rounded-full border border-primary/50 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.25em] text-primary">
        lately
      </span>

      {repos === null ? (
        <span className="block py-2 font-mono text-xs text-muted-foreground">loading…</span>
      ) : repos.length === 0 ? (
        <a
          href={`https://github.com/${USER}`}
          target="_blank"
          rel="noreferrer"
          className="block text-sm text-foreground underline decoration-primary/50"
        >
          github.com/{USER}
        </a>
      ) : (
        repos.map((r) => (
          <a
            key={r.html_url}
            href={r.html_url}
            target="_blank"
            rel="noreferrer"
            className="group/r mb-2 block rounded px-1 py-1 transition-colors hover:bg-primary/10"
          >
            <span className="block text-sm font-medium text-foreground group-hover/r:text-primary">
              {r.name}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {r.description ?? "no description yet"}
            </span>
          </a>
        ))
      )}

      {days && days.length > 0 && (
        <span className="mt-3 block border-t border-border pt-3">
          <span
            className="grid gap-[2px]"
            style={{ gridTemplateRows: "repeat(7, 1fr)", gridAutoFlow: "column" }}
          >
            {days.map((d) => (
              <span
                key={d.date}
                title={`${d.date}: ${d.count}`}
                className="h-[5px] w-[5px] rounded-[1px]"
                style={{
                  backgroundColor:
                    d.level === 0
                      ? "var(--color-muted-foreground)"
                      : "var(--color-primary)",
                  opacity: d.level === 0 ? 0.18 : 0.25 + d.level * 0.22,
                }}
              />
            ))}
          </span>
          {total !== null && (
            <span className="mt-2 block font-mono text-[0.6rem] text-muted-foreground">
              {total.toLocaleString()} contributions, past year
            </span>
          )}
        </span>
      )}
    </span>
  );
}
