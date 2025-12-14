export default function Navbar() {
    return (
        <div className="flex flex-row justify-between items-center p-4 md:p-4 md:mx-[36px]">
            {/* Titre principal */}
            <h1
                onClick={() => window.location.href = "/Home"}
                className="font-HelveticaNeue text-[15px] md:text-[25px] cursor-pointer"
            >
                <span className="text-[30px] md:text-[50px]">ROAR</span> music & sound.
            </h1>

            {/* Lien Info */}
            <h2
                onClick={() => window.location.href = "/About"}
                className="font-HelveticaNeue font-[950] text-[30px] md:text-[50px] cursor-pointer"
            >
                Info
            </h2>
        </div>
    );
}