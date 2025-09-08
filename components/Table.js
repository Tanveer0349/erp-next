export default function Table({ columns, data }) {
return (
<div className="overflow-x-auto">
<table className="w-full border-collapse border border-gray-300">
<thead>
<tr className="bg-gray-200">
{columns.map((col, idx) => (
<th key={idx} className="p-2 border border-gray-300 text-left">{col}</th>
))}
</tr>
</thead>
<tbody>
{data.map((row, rowIndex) => (
<tr key={rowIndex} className="hover:bg-gray-100">
{Object.values(row).map((cell, colIndex) => (
<td key={colIndex} className="p-2 border border-gray-300">{cell}</td>
))}
</tr>
))}
</tbody>
</table>
</div>
);
}