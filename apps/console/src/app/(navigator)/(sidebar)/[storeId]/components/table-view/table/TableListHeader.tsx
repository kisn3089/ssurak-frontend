type Header = { label: string; className: string };
type TableListHeaderProps = {
  headers: Header[];
};
export default function TableListHeader({ headers }: TableListHeaderProps) {
  return (
    <tr>
      {headers.map((item, index) => (
        <th
          key={index}
          className={`text-left p-3 first:pl-4 ${item.className}`}
        >
          {item.label}
        </th>
      ))}
    </tr>
  );
}
