export function EmptyState({ title, body }: { title: string; body: string }): JSX.Element {
  return (
    <section className="empty-state">
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}
