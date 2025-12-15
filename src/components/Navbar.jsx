export default function Navbar() {
    return (
        // ✅ Marges horizontales responsive (pas p-4 !)
        <div className="flex flex-row justify-between items-center px-roar-x-mobile md:px-roar-x-desktop ">
            {/* Titre principal */}
            <h1
                onClick={() => window.location.href = "/Home"}
                className="font-HelveticaNeue font-light text-[16px] md:text-[32px] cursor-pointer"
            >
                {/* ✅ ROAR en Medium */}
                <span className="text-[30px] md:text-[50px] font-medium">ROAR</span> 
                {" "}music{" "}
                <span className="text-[12px] md:text-[24px]">&</span>
                {" "}sound.
            </h1>

            {/* ✅ Info en Medium (pas de font-[950]) */}
            <h2
                onClick={() => window.location.href = "/About"}
                className="font-HelveticaNeue font-medium text-[30px] md:text-[50px] cursor-pointer"
            >
                Info
            </h2>
        </div>
    );
}