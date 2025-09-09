export default function LoadingSpinner({ size = "medium" }) {
  return (
    <div
      className={`animate-spin rounded-full border-t-4 border-blue-500 ${
        size === "large" ? "w-16 h-16" : "w-8 h-8"
      }`}
    />
  );
}
