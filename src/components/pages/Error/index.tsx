type ErrorPageProps = {
  message: string;
  detail: string;
};

function ErrorPage(props: ErrorPageProps) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1>{props.message}</h1>
      <p>{props.detail}</p>
    </div>
  );
}

export default ErrorPage;
