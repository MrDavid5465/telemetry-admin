import { useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { ComponentNode } from '../../../types/dashboard';
import { detectTemplateType, TemplateGaugeType, deepCopyNode } from './components/utils';
import { GET_TEMPLATES, ADD_TEMPLATE, UPDATE_TEMPLATE, REMOVE_TEMPLATE, UPLOAD_TEMPLATE_THUMBNAIL } from './queries';

export interface DashTemplate {
  id: string;
  name: string;
  gaugeType: TemplateGaugeType;
  component: ComponentNode;
  thumbnail?: string | null;
}

function parseTemplate(raw: any): DashTemplate | null {
  try {
    return {
      id:        raw.id,
      name:      raw.name,
      gaugeType: raw.gaugeType as TemplateGaugeType,
      component: JSON.parse(raw.component) as ComponentNode,
      thumbnail: raw.thumbnail ?? null,
    };
  } catch {
    return null;
  }
}

export function useTemplates() {
  const { data, loading, refetch } = useQuery(GET_TEMPLATES, { fetchPolicy: 'cache-and-network' });
  const [addTemplateMutation]      = useMutation(ADD_TEMPLATE,    { refetchQueries: [{ query: GET_TEMPLATES }] });
  const [updateTemplateMutation]   = useMutation(UPDATE_TEMPLATE, { refetchQueries: [{ query: GET_TEMPLATES }] });
  const [removeTemplateMutation]   = useMutation(REMOVE_TEMPLATE, { refetchQueries: [{ query: GET_TEMPLATES }] });
  const [uploadThumbnailMutation]  = useMutation(UPLOAD_TEMPLATE_THUMBNAIL, { refetchQueries: [{ query: GET_TEMPLATES }] });

  const templates: DashTemplate[] = (
    (data as any)?.getDashTemplates ?? []
  ).map(parseTemplate).filter(Boolean) as DashTemplate[];

  const createTemplate = useCallback(async (values: { name: string; gaugeType: string; component: string }): Promise<string> => {
    const result = await addTemplateMutation({ variables: { values } });
    return (result.data as any)?.addDashTemplate?.id ?? '';
  }, [addTemplateMutation]);

  const updateTemplate = useCallback(async (id: string, values: { name: string; gaugeType: string; component: string }) => {
    await updateTemplateMutation({ variables: { id, update: values } });
  }, [updateTemplateMutation]);

  const saveTemplate = useCallback(async (node: ComponentNode): Promise<string> => {
    const gaugeType = detectTemplateType(node);
    const result = await addTemplateMutation({
      variables: {
        values: {
          name:      node.name || 'Unnamed template',
          gaugeType,
          component: JSON.stringify(node),
        },
      },
    });
    return (result.data as any)?.addDashTemplate?.id ?? '';
  }, [addTemplateMutation]);

  const removeTemplate = useCallback(async (id: string) => {
    await removeTemplateMutation({ variables: { id } });
  }, [removeTemplateMutation]);

  const uploadThumbnail = useCallback(async (id: string, data: string) => {
    await uploadThumbnailMutation({ variables: { id, data } });
  }, [uploadThumbnailMutation]);

  const instantiateTemplate = useCallback((tmpl: DashTemplate): ComponentNode => {
    return deepCopyNode(tmpl.component);
  }, []);

  return { templates, loading, saveTemplate, createTemplate, updateTemplate, removeTemplate, uploadThumbnail, instantiateTemplate, refetchTemplates: refetch };
}
