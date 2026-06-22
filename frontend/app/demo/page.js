import { redirect } from 'next/navigation';

export default function DemoPage() {
	redirect('/editor/demo?type=flowchart');
}
