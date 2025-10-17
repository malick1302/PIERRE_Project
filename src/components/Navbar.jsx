
         {/* Header avec ROAR Sound et INFO */}
export default function Navbar(){
return( 

         <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1 md:mb-2">
         <div className="flex justify-end md:order-2  md:mb-0">
           <h2 onClick={() => window.location.href = "/About"} className="source-sans-light  text-3xl md:text-4xl  ">INFO</h2>
         </div>
         <h1 onClick={() => window.location.href = "/Home"} className="ml-0 mb-5 source-sans-light  text-4xl  md:mb-0 md:text-4xl md:order-1">ROAR Sound</h1>
       </div>
)
}