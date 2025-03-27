
          <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#FF5722]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">שאלונים</CardTitle>
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                <ClipboardList className="h-5 w-5 text-[#FF5722]" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">
                צפה בשאלונים שמולאו על ידי השחקנים
                <span className="block mt-1 text-amber-600 font-medium">* בבנייה כעת *</span>
              </p>
              <Button variant="default" className="w-full bg-[#FF5722] hover:bg-[#E64A19] cursor-not-allowed" disabled>
                <ClipboardList className="h-4 w-4 mr-2" />
                צפה בשאלונים
              </Button>
            </CardContent>
          </Card>
