import Header from "@/components/header/header";

export default async function Home() {
  return (<div> <Header breadcrumbs={[{ label: 'Home', href: '/' }]} showBackButton={false} />
    <p>
      Hola mundo
    </p>
  </div>);
}
