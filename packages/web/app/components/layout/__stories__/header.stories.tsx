import type { Meta, StoryObj } from '@storybook/react';
import { Header } from '../header';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    showMobileMenu: {
      control: 'boolean',
    },
    companyName: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithMobileMenuOpen: Story = {
  args: {
    showMobileMenu: true,
  },
};

export const CustomBranding: Story = {
  args: {
    companyName: 'ThemeForge',
    navigationItems: [
      { label: 'Templates', href: '#' },
      { label: 'Components', href: '#' },
      { label: 'Themes', href: '#' },
      { label: 'About', href: '#' },
    ],
  },
};
