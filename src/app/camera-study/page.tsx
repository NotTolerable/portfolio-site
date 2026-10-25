import type { Metadata } from 'next';
import { CameraStudy } from '@/components/camera-study';
export const metadata: Metadata = { title: 'Camera study — Babisan Pirapakaran', description: 'A cinematic nighttime street camera prototype, ending in an empty basketball court.', robots: { index: false, follow: true } };
export default function CameraStudyPage() { return <CameraStudy />; }
