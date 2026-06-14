'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email()
});

type FormData = z.infer<typeof schema>;

export function SampleForm() {
  const { register, handleSubmit, formState } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    toast.success('Form submitted');
    console.log('submitted', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm text-white/70">Name</label>
        <Input {...register('name')} />
      </div>
      <div>
        <label className="mb-2 block text-sm text-white/70">Email</label>
        <Input {...register('email')} />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}
