import type { Meta, StoryObj } from '@storybook/react';
import { PublicLayout } from '../public-layout';

const meta: Meta<typeof PublicLayout> = {
  title: 'Layout/PublicLayout',
  component: PublicLayout,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="p-6">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Welcome to ThemeForge</h1>
        <p className="mb-4 text-gray-600">
          This is the main content area. The header is part of the PublicLayout component and will be shown on all pages
          that use this layout.
        </p>
        <div className="rounded-lg bg-gray-100 p-4">
          <h2 className="mb-2 text-xl font-semibold">Sample Content</h2>
          <p>This content would typically come from page components via the Outlet.</p>
        </div>
      </div>
    ),
  },
};

export const WithMobileMenu: Story = {
  args: {
    children: (
      <div className="p-6">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Mobile Menu Demo</h1>
        <p className="text-gray-600">Click the hamburger menu button in the header to see the mobile navigation.</p>
      </div>
    ),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
