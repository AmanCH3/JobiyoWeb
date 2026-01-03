import { useParams, useNavigate } from 'react-router-dom';
import { useGetCompanyByIdQuery, useCreateCompanyMutation, useUpdateCompanyMutation } from '@/api/companyApi';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  location: z.string().optional(),
  description: z.string().optional(),
  logo: z.any().optional(),
});

const ManageCompany = () => {
  const { companyId } = useParams();
  const isEditMode = Boolean(companyId);
  const navigate = useNavigate();

  const { data: existingCompany, isLoading: isFetching } = useGetCompanyByIdQuery(companyId, { skip: !isEditMode });
  const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();

  const [preview, setPreview] = useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(companySchema),
  });

  useEffect(() => {
    if (isEditMode && existingCompany) {
      reset(existingCompany);
      setPreview(existingCompany.logo);
    }
  }, [isEditMode, existingCompany, reset]);
  
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.website) formData.append('website', data.website);
    if (data.location) formData.append('location', data.location);
    if (data.description) formData.append('description', data.description);
    if (data.logo && data.logo[0]) {
        formData.append('logo', data.logo[0]);
    }

    try {
        if (isEditMode) {
            await updateCompany({ id: companyId, formData }).unwrap();
            toast.success('Company updated successfully!');
        } else {
            await createCompany(formData).unwrap();
            toast.success('Company created successfully!');
        }
        navigate('/recruiter/companies');
    } catch (error) {
        toast.error(error?.data?.message || 'An error occurred.');
    }
  };

  const isLoading = isCreating || isUpdating;

  if (isFetching) return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
            <CardHeader>
                <CardTitle>{isEditMode ? 'Edit Company' : 'Create a New Company'}</CardTitle>
                <CardDescription>Fill in the details below.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Company Name</Label>
                            <Input id="name" {...register('name')} />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="website">Website URL</Label>
                            <Input id="website" placeholder="https://example.com" {...register('website')} />
                            {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" placeholder="e.g., San Francisco, CA" {...register('location')} />
                            {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                        </div>
                    </div>
                     <div className="grid gap-2">
                        <Label>Company Logo</Label>
                        <Controller
                            name="logo"
                            control={control}
                            render={({ field }) => (
                                <Input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        field.onChange(e.target.files);
                                        setPreview(URL.createObjectURL(e.target.files[0]));
                                    }}
                                />
                            )}
                        />
                         {preview && <img src={preview} alt="Logo Preview" className="mt-2 h-24 w-24 rounded-full object-cover border"/>}
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" rows={5} {...register('description')} />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
                <Button variant="outline" onClick={() => navigate('/recruiter/companies')}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? 'Save Changes' : 'Create Company'}
                </Button>
            </CardFooter>
        </Card>
    </form>
  );
};

export default ManageCompany;