import { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Award, Calendar, CameraIcon, Edit2, ImagePlus } from 'lucide-react';
import type { Aluno } from '../model/Aluno';
import { supabase } from '../service/supabase';
import { parse, isValid, format } from "date-fns";





type AlunoFormProps = {
    aluno: Aluno | null;
    onClose: () => void;
    onSaved: (aluno: Aluno) => void;

}

export default function AlunoForm({ aluno, onClose, onSaved }: AlunoFormProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [erroData, setErroData] = useState("");
    const isEditing = !!aluno; // true se for edição, false se for criação
    const planos = [
        { id: 1, nome: 'Básico' },
        { id: 2, nome: 'Master' },
    ];


    useEffect(() => {
        if (aluno) {
            setFormData({
                nome: aluno.nome,
                dataNascimento: aluno.data_nascimento,
                telefone: aluno.telefone,
                endereco: aluno.endereco,
                tipoPlano: aluno.plano_id,
            });
            setPreview(aluno.foto_url);
        } else {
            setFormData({
                nome: '',
                dataNascimento: '',
                telefone: '',
                endereco: '',
                tipoPlano: '',
            });
            setPreview(null);
        }
    }, [aluno]);

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 2) return digits;
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }

    // Converte dd/MM/yyyy → yyyy-MM-dd (para salvar)
    function toISODate(data: string): string | null {
        const parsed = parse(data, "dd/MM/yyyy", new Date());
        return isValid(parsed) ? format(parsed, "yyyy-MM-dd") : null;
    }

    function displayDate(value: string | null): string {
        if (!value) return "";

        // Caso ISO (yyyy-MM-dd)
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [ano, mes, dia] = value.split("-");
            return `${dia}/${mes}/${ano}`;
        }

        // Caso já esteja em dd/MM/yyyy (digitado pelo usuário)
        return value;
    }

    // Converte yyyy-MM-dd → dd/MM/yyyy (para exibir no input)
    function maskDate(value: string): string {
        const digits = value.replace(/\D/g, "").slice(0, 8);

        if (digits.length >= 5) {
            return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
        } else if (digits.length >= 3) {
            return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        } else {
            return digits;
        }
    }



    const convertToWebP = (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const webpFile = new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
                                    type: "image/webp",
                                });
                                setFormData((prev) => ({ ...prev, imageFile: webpFile }));

                                resolve(webpFile);
                            }
                        },
                        "image/webp",
                        0.8 // qualidade (0.8 = 80%)
                    );
                };
            };
            reader.readAsDataURL(file);

        });
    };




    // Função para gerar slug único
    function gerarSlugPaciente(nome: string, existentes: string[]): string {
        // remove acentos e caracteres especiais
        const baseSlug = nome
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // remove acentos
            .replace("", "-") //espaços -> hífen
            .replace(/[^a-z0-9]/g, ""); //remove caracteres inválidos

        // garante unicidade
        let slug = baseSlug;
        let contador = 1;
        while (existentes.includes(slug)) {
            slug = `${baseSlug}-${contador}`;
            contador++;
        }

        return slug;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação simples
        if (!formData.nome || !formData.tipoPlano) {
            alert("Por favor, preencha pelo menos o nome e o plano.");
            return; // interrompe o fluxo
        }
        setLoading(true);
        try {
            let fotoUrl: string | undefined;

            const { data: files, error } = await supabase.storage
                .from("foto")
                .list(); // lista objetos/pastas no bucket

            if (error) throw error;

            const existentes = files.map(f => f.name); // nomes já existentes            
            const slug = aluno?.slug ?? gerarSlugPaciente(formData.nome, existentes);


            // Se tiver foto, faz upload para o bucket "pacientes"
            if (formData.imageFile) {
                const webpFile = await convertToWebP(formData.imageFile);
                const filePath = `${slug}/foto-${Date.now()}.webp`;

                const { data, error } = await supabase.storage
                    .from("foto")
                    .upload(filePath, webpFile, { upsert: true });

                if (error) throw error;
                if (!data) throw new Error("Upload não retornou caminho");
                fotoUrl = supabase.storage
                    .from("foto")
                    .getPublicUrl(filePath).data.publicUrl;
            }

            const isoDate = toISODate(formData.dataNascimento);
            if (aluno) {
                const updateData: any = {
                    nome: formData.nome,
                    data_nascimento: isoDate,
                    telefone: formData.telefone,
                    endereco: formData.endereco,
                    plano_id: formData.tipoPlano,
                }
                if (fotoUrl) updateData.foto_url = fotoUrl;

                const { data: updateAluno, error: updateError } = await supabase
                    .from("alunos")
                    .update(updateData)
                    .eq("id", aluno.id)
                    .select(`*,planos(nome)`)
                    .single();
                if (updateError) throw updateError;
                onSaved(updateAluno);

            } else {
                //Novo Aluno
                const { data: novoAluno, error: insertError } = await supabase
                    .from("alunos")
                    .insert({
                        nome: formData.nome,
                        slug,
                        data_nascimento: isoDate,
                        telefone: formData.telefone,
                        endereco: formData.endereco,
                        plano_id: formData.tipoPlano,
                        foto_url: fotoUrl
                    })
                    .select(`*,planos(nome)`)
                    .single();
                if (insertError) throw insertError;
                onSaved(novoAluno);
            }

            { isEditing ? alert("Aluno atualizado com sucesso!") : alert("Aluno cadastrado com sucesso!") };
            setLoading(false);
            onClose();

        } catch (err) {
            console.error("Erro ao salvar aluno:", err);
            { isEditing ? alert("Erro ao Editar Aluno") : alert("Ocorreu um erro ao salvar. Tente novamente.") };
            setLoading(false);
            return;
        } finally {
            setLoading(false);
        }
    }


    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            //const webpFile = await convertToWebP(file);
            // preview
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);

            // salvar no estado

            setFormData((prev) => ({ ...prev, imageFile: file }));
        }
    };


    const handleRemoveImage = () => {
        setPreview(null);
        setFormData((prev) => ({
            ...prev,
            imageFile: undefined
        }));
    };



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mt-20 overflow-y-auto">
                <div className="bg-linear-to-r from-primary to-secondary px-6 py-4 flex items-center justify-between">
                    <h2 className="text-white font-bold text-xl">
                        {aluno ? 'Editar aluno' : 'Novo aluno'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                    >
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    Object.fromEntries(
                        new FormData(e.currentTarget).entries()
                    );
                    handleSubmit(e);
                }} className="p-6 space-y-5">
                    <div className={`flex items-center  bg-white                              
                                 rounded-full shadow-md mx-auto w-30 h-30  border-2 ${isEditing ? 'border-blue-600' : 'border-green-600'}`}>

                        <div className="relative w-full h-full  ">

                            {preview ? (
                                <>
                                    <img src={preview} alt="Preview" className="w-full h-full rounded-full object-cover " />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute bottom-25 left-25 z-20 bg-danger text-white rounded-full p-1.5 hover:bg-red-200 shadow-lg transition-transform hover:scale-110 border border-white/20"
                                        title="Remover Foto"
                                    >
                                        <X className="h-5 w-5" />
                                    </button></>
                            ) : (
                                <div
                                    className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                    <CameraIcon className="h-12 w-12" />
                                </div>
                            )}
                            {/* Botão de Remover: Sempre visível se houver imagem carregada */}
                            <label
                                htmlFor="fileInput"
                                className={`absolute -bottom-3 right-0 bg-white  rounded-full p-1 border-2 ${isEditing ? 'border-blue-800' : 'border-green-800'} shadow-md cursor-pointer hover:shadow-lg transition-transform hover:scale-110`}>
                                {isEditing ? <Edit2 className="text-gray-500 w-5 h-5" /> : <ImagePlus className="text-gray-500 w-5 h-5" />}
                            </label>
                            <input
                                type='file'
                                id="fileInput"
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>

                    </div>


                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1.5">Nome completo</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                            <input
                                type="text"
                                value={formData.nome || ''}
                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                placeholder="Nome do aluno"
                                className={`w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition }`}
                            />
                        </div>

                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1.5">Data de nascimento</label>
                        <div className="relative">
                            <Calendar size={16} className={`absolute left-3 top-2.5 text-primary`} />
                            <input
                                type="text"
                                value={displayDate(formData.dataNascimento) || ''}
                                onChange={e => {
                                    setFormData({ ...formData, dataNascimento: maskDate(e.target.value) });
                                    setErroData(""); // limpa erro enquanto digita
                                }}
                                onBlur={e => {
                                    const valido = toISODate(e.target.value);
                                    if (!valido) {
                                        setErroData("Data inválida.");
                                        e.target.focus(); // mantém o foco no campo
                                    }
                                }}
                                placeholder="dd/mm/yyyy"
                                className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${erroData ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-primary"
                                    }`}
                            />
                            {erroData && (
                                <p className="text-red-500 text-xs mt-1">{erroData}</p>
                            )}

                        </div>

                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1.5">Telefone</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                            <input
                                type="text"
                                value={formData.telefone || ''}
                                onChange={e => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                                placeholder="(00) 00000-0000"
                                className={`w-full pl-9 pr-4 py-2.5 border  border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition }`}
                            />
                        </div>

                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1.5">Endereço</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-3 text-primary" />
                            <textarea
                                value={formData.endereco || ''}
                                onChange={e => setFormData({ ...formData, endereco: e.target.value })}
                                placeholder="Rua, número, bairro, cidade"
                                rows={2}
                                className={`w-full pl-9 pr-4 py-2.5 border  border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition resize-none }`}
                            />
                        </div>

                    </div>

                    <div >
                        <label className="block text-sm font-semibold text-primary mb-2">
                            <Award size={14} className="inline mr-1 text-yellow" />
                            Tipo de Plano
                        </label>

                        <div className="flex gap-10">
                            {planos.map(plano => (
                                <label key={plano.id} className="flex items-center mb-2 cursor-pointer">
                                    <label className={`inline-flex items-center p-3 mr-2 rounded-full cursor-pointer border-2 ${formData.tipoPlano === plano.id ? 'border-yellow bg-primary text-white' : 'border-gray-300 hover:bg-gray-100'} transition`}>
                                        <input type="radio"
                                            name="tipoPlano"
                                            value={plano.id}
                                            checked={formData.tipoPlano === plano.id}
                                            onChange={() => setFormData({ ...formData, tipoPlano: plano.id })}
                                            className="hidden"
                                        />
                                    </label>
                                    {plano.nome}
                                </label>
                            ))}
                        </div>

                    </div>



                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-[#8B4513]/10 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 bg-linear-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:from-yellow hover:to-yellow/70 transition disabled:opacity-60"
                        >
                            {loading ? 'Salvando...' : (aluno ? 'Atualizar' : 'Cadastrar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
