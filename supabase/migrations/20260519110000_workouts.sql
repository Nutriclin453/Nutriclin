-- Create workouts table
create table if not exists public.workouts (
    id uuid default gen_random_uuid() primary key,
    patient_id uuid references public.patients(id) on delete cascade,
    exercises jsonb not null default '[]'::jsonb,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id)
);

-- Set up RLS
alter table public.workouts enable row level security;

create policy "Users can view all workouts"
    on public.workouts for select
    using (true);

create policy "Users can insert their own workouts"
    on public.workouts for insert
    with check (auth.uid() = created_by);

create policy "Users can update their own workouts"
    on public.workouts for update
    using (auth.uid() = created_by);

create policy "Users can delete their own workouts"
    on public.workouts for delete
    using (auth.uid() = created_by);
