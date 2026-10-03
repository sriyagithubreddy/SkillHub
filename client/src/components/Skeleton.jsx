export default function Skeleton({ height = 180, width = '100%', style = {} }) {
  return <div className="skeleton" style={{ height, width, ...style }} />;
}
