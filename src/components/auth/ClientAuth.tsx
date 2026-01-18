import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export function ClientAuth() {
  const [activeTab, setActiveTab] = useState('login')

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">Ou acesse sua conta</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie todos os seus pedidos em um só lugar
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="register">Criar Conta</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Entre com seu e-mail e senha ou conta Google.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Criar Conta</CardTitle>
              <CardDescription>
                Cadastre-se para acompanhar seus projetos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm onSuccess={() => setActiveTab('login')} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
